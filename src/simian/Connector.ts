/// <reference path="../../typings/index.d.ts" />

import * as mysql from 'mysql';
import {Sql} from '../mysql/sql';
import * as Promise from 'bluebird';

import { Inventory, Folder, Item } from '../halcyon/Inventory';
import { User, Credential} from '../halcyon/User';
import { SimUser } from './User';
import { UUIDString } from '../halcyon/UUID';
import { Asset } from '../whip/asset';

let assetTypeMap: {[key:string]:number} = {
  'application/octet-stream': -1,
  'application/vnd.ll.folder': -1,
  'image/x-j2c': 0,
  'application/ogg': 1,
  'audio/ogg': 1,
  'application/vnd.ll.callingcard': 2,
  'application/vnd.ll.landmark': 3,
  // script type obsolete: 4,
  'application/vnd.ll.clothing': 5,
  'application/vnd.ll.primitive': 6,
  'application/vnd.ll.notecard': 7,
  'application/vnd.ll.rootfolder': 8,
  // original root folder: 9,
  'application/vnd.ll.lsltext': 10,
  'application/vnd.ll.lslbyte': 11,
  'image/tga': 12,
  'application/vnd.ll.bodypart': 13,
  'application/vnd.ll.trashfolder': 14,
  'application/vnd.ll.snapshotfolder': 15,
  'application/vnd.ll.lostandfoundfolder': 16,
  'audio/x-wav': 17,
  //image TGA: 18,
  'image/jpeg': 19,
  'application/vnd.ll.animation': 20,
  'application/vnd.ll.gesture': 21,
  //'application/x-metaverse-simstate': 22,
  'application/vnd.ll.favoritefolder': 23,
  //'application/vnd.ll.link': 24,
  'application/vnd.ll.currentoutfitfolder': 46,
  'application/vnd.ll.outfitfolder': 47,
  'application/vnd.ll.myoutfitsfolder': 48,
  'application/vnd.ll.mesh': 49,
  //'application/vnd.ll.linkfolder':
}

let invTypeMap: {[key:number]:number} = {
  //userdefined: -1,
  0: 0,             // Texture
  12: 0,            // Texture
  19: 0,            // Texture
  1: 1,             // Sound
  2: 2,             // Calling Card
  3: 3,             // Landmark
  5: 18,            // wearable (bodypart)
  6: 6,             // Object
  7: 7,             // Notecard
  10: 10,           // script
  22: 15,           // Snapshot
  //Attachment: 17,
  13: 18,           // wearable (clothing)
  20: 19,           // Animation
  21: 20,           // Gesture
  49: 22,           // Mesh
}

interface InventoryRow {
  ID: string
  Name: string
  ParentID: string
  OwnerID: string
  CreatorID: string
  AssetID: string
  Description: string
  ContentType: string
  Version: number
  CreationDate: Date
  Type: string
  LeftNode: number
  RightNode: number
  ExtraData: string
}

interface UserRow {
  ID: string
  Name: string
  Email: string
  AccessLevel: number
  Identifier: string
  Type: string
  Credential: string
  UserID: string
  Enabled: number
}

export class SimianConnector {
  db: Sql

  constructor(conf) {
    this.db = new Sql(conf);
  }

  getAsset(uuid: UUIDString): Promise<Asset> {
    return new Promise<Asset>( (resolve, reject) => {
      this.db.pool.query('SELECT Data, ContentType, CreatorID, UNIX_TIMESTAMP(CreationDate) AS Created, Temporary FROM AssetData WHERE ID=?', uuid.toString(), (err, rows: any[]) => {
        if(err) return reject(err);
        if(!rows || rows.length < 1) return resolve(null);
        resolve(rows[0]);
      });
    }).then( (row: any) => {
      if(row === null) return row;
      //constructor(id: UUIDString, type: number, local: boolean, temporary: boolean, created: number, name: string, description: string, data: Buffer) {
      return new Asset(
        uuid,
        assetTypeMap[row.ContentType],
        false,
        row.Temporary === 1? true : false,
        row.Created,
        '',
        '',
        row.Data
      );
    });
  }

  getInventory(uuid: string): Promise<Inventory> {
    return new Promise<Inventory>(resolve => {
      let folders: { [key: string]: Folder } = {};
      let items: { [key: string]: Item } = {};
      this.db.pool.query('SELECT * FROM Inventory WHERE OwnerID="' + uuid + '"', (err: mysql.IError, rows: InventoryRow[]) => {
        if (err) {
          throw new Error(err.message);
        } else {
          let folders: Folder[] = [];
          let items: Item[] = [];
          for (var r of rows) {
            if(r.Type === 'Folder'){
              let f = this.buildFolder(r);
              if(f){
                folders.push(f);
              }
            } else {
              let i = this.buildItem(r);
              if(i){
                items.push(i);
              }
            }
          }
          resolve(new Inventory(folders,items));
        }
      });
    });
  }

  getUser(id: UUIDString): Promise<User> {
    return new Promise<User>(resolve=> {
      this.db.pool.query('SELECT * FROM Users, Identities WHERE Identities.UserID=Users.ID AND Users.ID=?', id.toString(), (err: mysql.IError, rows: any[]) => {
        if(err)
          throw err;
        if(rows.length == 0)
          throw new Error('User ' + id.toString() + ' was not found in simian');

        resolve(this.buildUser(rows[0]))
      });
    });
  }

  getOwnerAccounts(): Promise<User[]> {
    return new Promise<User[]>(resolve=> {
      this.db.pool.query('SELECT * FROM Users, Identities WHERE Identities.UserID=Users.ID', (err: mysql.IError, rows: any[]) => {
        if (err) {
          throw err;
        } else {
          let owners: User[] = [];
          for (var r of rows) {
            let o = this.buildUser(r);
            if(o){
              owners.push(o);
            }
          }
          resolve(owners);
        }
      });
    }).then( (users: User[]) => {
      //populate user structure
      for(var u of users){
        /*
        u.passwordSalt // not used
        u.homeRegion
        u.homeLocationX
        u.homeLocationY
        u.homeLocationZ
        u.homeLookAtX
        u.homeLookAtY
        u.homeLookAtZ
        u.created
        u.lastLogin
        u.userInventoryURI
        u.userAssetURI
        u.profileCanDoMask
        u.profileWantDoMask
        u.profileAboutText
        u.profileFirstText
        u.profileImage
        u.profileFirstImage
        u.webLoginKey
        u.homeRegionID
        u.userFlags

        u.customType
        u.partner
        u.profileURL
        u.skillsMask
        u.skillsText
        u.wantToMask
        u.wantToText
        u.languagesText
        */
      }

      return users;
    });
  }

  private buildUser(r: UserRow): User {
    let names: string[] = r.Name.split(' ');
    return new SimUser(
      new UUIDString(r.ID),
      names[0],
      names[1],
      r.Email,
      Credential.fromOpensim(r.Credential),
      r.AccessLevel,
      r.Enabled == 0? false : true
    );
  }

  private buildFolder(r: InventoryRow): Folder {
    return new Folder(
      r.Name,
      assetTypeMap[r.ContentType] || -1,
      r.Version,
      new UUIDString(r.ID),
      new UUIDString(r.OwnerID),
      r.ParentID ? new UUIDString(r.ParentID) : UUIDString.zero()
    );
  }

  private buildItem(r: InventoryRow): Item {
    let extraData = {
      Flags: 1,
      SalePrice: 0,
      LinkedItemType: null,
      Permissions: {
        BaseMask: 647168,
        EveryoneMask: 581632,
        NextOwnerMask: 647168,
        OwnerMask: 647168,
        GroupMask: 0,
      }
    };

    if(r.ExtraData !== null && r.ExtraData !== '' && r.ExtraData !== '{}'){
      try{
        let readData = JSON.parse(r.ExtraData);
        if(readData.Flags) extraData.Flags = readData.Flags;
        if(readData.SalePrice) extraData.SalePrice = readData.SalePrice;
        if(readData.Permissions && readData.Permissions.BaseMask) extraData.Permissions.BaseMask = readData.Permissions.BaseMask;
        if(readData.Permissions && readData.Permissions.EveryoneMask) extraData.Permissions.EveryoneMask = readData.Permissions.EveryoneMask;
        if(readData.Permissions && readData.Permissions.NextOwnerMask) extraData.Permissions.NextOwnerMask = readData.Permissions.NextOwnerMask;
        if(readData.Permissions && readData.Permissions.OwnerMask) extraData.Permissions.OwnerMask = readData.Permissions.OwnerMask;
        if(readData.Permissions && readData.Permissions.GroupMask) extraData.Permissions.GroupMask = readData.Permissions.GroupMask;
      } catch(e){
        //do nothing, ignore this extraData
      }
    }

    let i = new Item();
    i.assetID = new UUIDString(r.AssetID);
    i.assetType = assetTypeMap[r.ContentType] || -1;
    i.inventoryName = r.Name;
    i.inventoryDescription = r.Description;
    i.invType = invTypeMap[i.assetType];
    i.creatorID = new UUIDString(r.CreatorID);

    i.inventoryNextPermissions = extraData.Permissions.NextOwnerMask;
    i.inventoryCurrentPermissions = extraData.Permissions.OwnerMask
    i.inventoryBasePermissions = extraData.Permissions.BaseMask;
    i.inventoryEveryOnePermissions = extraData.Permissions.EveryoneMask;
    i.salePrice = extraData.SalePrice;
    //i.saleType

    i.creationDate = Math.floor(r.CreationDate.getTime()/1000);
    i.groupID = UUIDString.zero();
    i.groupOwned = 0;
    i.flags = 0;
    i.inventoryID = new UUIDString(r.ID);
    i.avatarID = new UUIDString(r.OwnerID);
    i.parentFolderID = new UUIDString(r.ParentID);
    i.inventoryGroupPermissions = 0;
    return i;
  }
}
