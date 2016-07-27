

import * as mysql from 'mysql';
import {Sql} from '../mysql/sql';
import * as Promise from 'bluebird';

import { User, Credential, Appearance } from './User';
import { Inventory, Folder, Item } from './Inventory';
import { UUIDString } from './UUID';
import { Estate } from './Estate';
import { Group, GroupMembership, GroupRole } from './Group';

export interface sqlConfig {
  db_host: string
  db_user: string
  db_pass: string
  db_name: string
}

export class SqlConnector {
  db: Sql

  constructor(c: sqlConfig) {
    this.db = new Sql(c);
  }

  addAppearance(appearance: Appearance): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let args = {
        Owner: appearance.Owner.toString(),
        Serial: appearance.Serial,
        Visual_Params: appearance.Visual_Params,
        Texture: appearance.Texture,
        Avatar_Height: appearance.Avatar_Height,
        Body_Item: appearance.Body_Item.toString(),
        Body_Asset: appearance.Body_Asset.toString(),
        Skin_Item: appearance.Skin_Item.toString(),
        Skin_Asset: appearance.Skin_Asset.toString(),
        Hair_Item: appearance.Hair_Item.toString(),
        Hair_Asset: appearance.Hair_Asset.toString(),
        Eyes_Item: appearance.Eyes_Item.toString(),
        Eyes_Asset: appearance.Eyes_Asset.toString(),
        Shirt_Item: appearance.Shirt_Item.toString(),
        Shirt_Asset: appearance.Shirt_Asset.toString(),
        Pants_Item: appearance.Pants_Item.toString(),
        Pants_Asset: appearance.Pants_Asset.toString(),
        Shoes_Item: appearance.Shoes_Item.toString(),
        Shoes_Asset: appearance.Shoes_Asset.toString(),
        Socks_Item: appearance.Socks_Item.toString(),
        Socks_Asset: appearance.Socks_Asset.toString(),
        Jacket_Item: appearance.Jacket_Item.toString(),
        Jacket_Asset: appearance.Jacket_Asset.toString(),
        Gloves_Item: appearance.Gloves_Item.toString(),
        Gloves_Asset: appearance.Gloves_Asset.toString(),
        Undershirt_Item: appearance.Undershirt_Item.toString(),
        Undershirt_Asset: appearance.Undershirt_Asset.toString(),
        Underpants_Item: appearance.Underpants_Item.toString(),
        Underpants_Asset: appearance.Underpants_Asset.toString(),
        Skirt_Item: appearance.Skirt_Item.toString(),
        Skirt_Asset: appearance.Skirt_Asset.toString(),
        alpha_item: appearance.alpha_item.toString(),
        alpha_asset: appearance.alpha_asset.toString(),
        tattoo_item: appearance.tattoo_item.toString(),
        tattoo_asset: appearance.tattoo_asset.toString(),
        physics_item: appearance.physics_item.toString(),
        physics_asset: appearance.physics_asset.toString(),
      }
      this.db.pool.query('INSERT INTO avatarappearance SET ?', args, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  getAppearance(id: UUIDString): Promise<Appearance> {
    return new Promise<Appearance>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM avatarappearance WHERE Owner=?', id.toString(), (err, row) => {
        if (err) return reject(err);
        if (!row || row.length !== 1)
          return reject(new Error('appearance for user ' + id.toString() + ' not found.'));
        let r = row[0];
        let a = new Appearance();
        a.Owner = new UUIDString(r.Owner);
        a.Serial = r.Serial;
        a.Visual_Params = r.Visual_Params;
        a.Texture = r.Texture;
        a.Avatar_Height = r.Avatar_Height;
        a.Body_Item = new UUIDString(r.Body_Item);
        a.Body_Asset = new UUIDString(r.Body_Asset);
        a.Skin_Item = new UUIDString(r.Skin_Item);
        a.Skin_Asset = new UUIDString(r.Skin_Asset);
        a.Hair_Item = new UUIDString(r.Hair_Item);
        a.Hair_Asset = new UUIDString(r.Hair_Asset);
        a.Eyes_Item = new UUIDString(r.Eyes_Item);
        a.Eyes_Asset = new UUIDString(r.Eyes_Asset);
        a.Shirt_Item = new UUIDString(r.Shirt_Item);
        a.Shirt_Asset = new UUIDString(r.Shirt_Asset);
        a.Pants_Item = new UUIDString(r.Pants_Item);
        a.Pants_Asset = new UUIDString(r.Pants_Asset);
        a.Shoes_Item = new UUIDString(r.Shoes_Item);
        a.Shoes_Asset = new UUIDString(r.Shoes_Asset);
        a.Socks_Item = new UUIDString(r.Socks_Item);
        a.Socks_Asset = new UUIDString(r.Socks_Asset);
        a.Jacket_Item = new UUIDString(r.Jacket_Item);
        a.Jacket_Asset = new UUIDString(r.Jacket_Asset);
        a.Gloves_Item = new UUIDString(r.Gloves_Item);
        a.Gloves_Asset = new UUIDString(r.Gloves_Asset);
        a.Undershirt_Item = new UUIDString(r.Undershirt_Item);
        a.Undershirt_Asset = new UUIDString(r.Undershirt_Asset);
        a.Underpants_Item = new UUIDString(r.Underpants_Item);
        a.Underpants_Asset = new UUIDString(r.Underpants_Asset);
        a.Skirt_Item = new UUIDString(r.Skirt_Item);
        a.Skirt_Asset = new UUIDString(r.Skirt_Asset);
        a.alpha_item = new UUIDString(r.alpha_item);
        a.alpha_asset = new UUIDString(r.alpha_asset);
        a.tattoo_item = new UUIDString(r.tattoo_item);
        a.tattoo_asset = new UUIDString(r.tattoo_asset);
        a.physics_item = new UUIDString(r.physics_item);
        a.physics_asset = new UUIDString(r.physics_asset);
        resolve(a);
      });
    });
  }

  getInventory(id: UUIDString): Promise<Inventory> {
    return new Promise<Inventory>((resolve, reject) => {
      let folders: Folder[] = [];
      let items: Item[] = [];
      this.db.pool.query('SELECT * FROM inventoryfolders WHERE agentID=?', id.toString(), (err, rows) => {
        if (err) return reject(err);
        for (let r of rows) {
          folders.push(new Folder(
            r.folderName,
            r.type,
            r.version,
            new UUIDString(r.folderID),
            new UUIDString(r.agentID),
            new UUIDString(r.parentFolderID)
          ));
        }
        this.db.pool.query('SELECT * FROM inventoryitems WHERE avatarID=?', id.toString(), (err, rows) => {
          if (err) return reject(err);
          for (let r of rows) {
            let i: Item = new Item();
            i.assetID = new UUIDString(r.assetID);
            i.assetType = r.assetType;
            i.inventoryName = r.inventoryName;
            i.inventoryDescription = r.inventoryDescription;
            i.inventoryNextPermissions = r.inventoryNextPermissions;
            i.inventoryCurrentPermissions = r.inventoryCurrentPermissions;
            i.invType = r.invType;
            i.creatorID = new UUIDString(r.creatorID);
            i.inventoryBasePermissions = r.inventoryBasePermissions;
            i.inventoryEveryOnePermissions = r.inventoryEveryOnePermissions;
            i.salePrice = r.salePrice;
            i.saleType = r.saleType;
            i.creationDate = r.creationDate;
            i.groupID = r.groupID;
            i.groupOwned = r.groupOwned;
            i.flags = r.flags;
            i.inventoryID = new UUIDString(r.inventoryID);
            i.avatarID = new UUIDString(r.avatarID);
            i.parentFolderID = new UUIDString(r.parentFolderID);
            i.inventoryGroupPermissions = r.inventoryGroupPermissions;
            items.push(i);
          }
          resolve(new Inventory(folders, items));
        });
      })
    });
  }

  deleteInventory(u: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM inventoryfolders WHERE agentID=?', u.getUUID().toString(), (err) => {
        if (err) return reject(err);

        this.db.pool.query('DELETE FROM inventoryitems WHERE avatarID=?', u.getUUID().toString(), (err) => {
          if (err) return reject(err);

          resolve();
        });
      });
    });
  }

  addInventory(inventory: Inventory): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      //push all of the inventory folders in first
      let folders = inventory.getFolders();
      let query = 'INSERT INTO inventoryfolders (folderName, type, version, folderID, agentID, parentFolderID) VALUES ?';
      let values = [];
      for (let f of folders) {
        values.push([f.folderName, f.Type, f.version, f.folderID.toString(), f.agentID.toString(), f.parentFolderID.toString()]);
      }
      this.db.pool.query(query, [values], (err: mysql.IError) => {
        if (err) return reject(err);

        //once folders are inserted, insert items
        let items = inventory.getItems();
        let tasks = items.map((i: Item) => {
          if(i.assetID === undefined){
            console.log(i);
          }
          return new Promise<void>((resolve, reject) => {
            this.db.pool.query('INSERT INTO inventoryitems SET ?', {
              assetID: i.assetID.toString(),
              assetType: i.assetType,
              inventoryName: i.inventoryName,
              inventoryDescription: i.inventoryDescription || 'description',
              inventoryNextPermissions: i.inventoryNextPermissions,     //???
              inventoryCurrentPermissions: i.inventoryCurrentPermissions,  //???
              invType: i.invType,
              creatorID: i.creatorID.toString(),
              inventoryBasePermissions: i.inventoryBasePermissions || 647168,     //???
              inventoryEveryOnePermissions: i.inventoryEveryOnePermissions || 0, //???
              salePrice: i.salePrice || 0,
              saleType: i.saleType || 0,
              creationDate: i.creationDate,
              groupID: i.groupID.toString(),
              groupOwned: i.groupOwned || 0,
              flags: i.flags || 0,
              inventoryID: i.inventoryID.toString(),
              avatarID: i.avatarID.toString(),
              parentFolderID: i.parentFolderID.toString(),
              inventoryGroupPermissions: i.inventoryGroupPermissions || 0
            }, (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
        Promise.all(tasks).then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        })
      });
    });
  }

}
