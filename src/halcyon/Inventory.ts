
import { UUIDString } from './UUID';
import { Sql } from '../mysql/sql';

import fs = require("fs");

export class Inventory {
  private root: Folder
  private folders: {[key:string]: Folder}

  constructor(folders: Folder[], items: Item[]){
    this.consumeFoldersAndItems(folders, items);
  }

  private consumeFoldersAndItems(folders: Folder[], items: Item[]){
    //generate tree structure of folders
    this.folders = {};
    //locate root folder
    for(let f of folders){
      if(f.parentFolderID === null || f.parentFolderID.toString() === UUIDString.zero().toString()){
        this.root = f;
        this.folders[f.folderID.toString()] = f;
        folders.splice(folders.indexOf(f),1);
      }
    }

    //iterate repeatedly and build the inventory tree
    //if we are passed an invalid tree, this may never exit
    while(folders.length > 0){
      for(let f of folders){
        if(f.parentFolderID.toString() in this.folders){
          this.folders[f.parentFolderID.toString()].children.push(f)
          this.folders[f.folderID.toString()] = f;
          folders.splice(folders.indexOf(f),1);
        }
      }
    }

    //all folders are in the tree
    for(let i of items){
      if(i.parentFolderID.toString() in this.folders){
        this.folders[i.parentFolderID.toString()].items.push(i);
      }
    }
  }

  changeOwner(uuid: UUIDString) {
    let uuidMap: { [key: string]: UUIDString } = {};
    let folders: Folder[] = [];
    let items: Item[] = [];
    //generate new ids for folders
    for (let folder of this.getFolders()) {
      uuidMap[folder.folderID.toString()] = UUIDString.random();
    }
    //map zero back to zero
    uuidMap[UUIDString.zero().toString()] = UUIDString.zero();
    //generate new ids for inventory items
    for (let item of this.getItems()) {
      uuidMap[item.inventoryID.toString()] = UUIDString.random();
    }

    //generate new folder list, translating ids
    for (let folder of this.getFolders()) {
      let f = new Folder(
        folder.folderName,
        folder.Type,
        folder.version,
        uuidMap[folder.folderID.toString()],
        uuid,
        uuidMap[folder.parentFolderID.toString()]
        );
      folders.push(f);
    }

    //generate new item list, translating ids
    for (let item of this.getItems()) {
      let i = new Item();
      i.assetID = item.assetID;
      i.assetType = item.assetType;
      if (i.assetType === 24) {
        //links do not have assets, assetID points to an inventory item
        i.assetID = uuidMap[item.assetID.toString()];
      }
      i.inventoryName = item.inventoryName;
      i.inventoryDescription = item.inventoryDescription;
      i.inventoryNextPermissions = item.inventoryNextPermissions;
      i.inventoryCurrentPermissions = item.inventoryCurrentPermissions;
      i.invType = item.invType;
      i.creatorID = item.creatorID;
      i.inventoryBasePermissions = item.inventoryBasePermissions;
      i.inventoryEveryOnePermissions = item.inventoryEveryOnePermissions;
      i.salePrice = item.salePrice;
      i.saleType = item.saleType;
      i.creationDate = item.creationDate;
      i.groupID = item.groupID;
      i.groupOwned = item.groupOwned;
      i.flags = item.flags;
      i.inventoryID = uuidMap[item.inventoryID.toString()];
      i.avatarID = uuid;
      i.parentFolderID = uuidMap[item.parentFolderID.toString()];
      i.inventoryGroupPermissions = item.inventoryGroupPermissions;
      items.push(i);
    }

    this.consumeFoldersAndItems(folders, items);
  }

  static FromIar(fileName: string): Promise<Inventory>{
    return new Promise<Inventory>( (resolve, reject) => {
      if(!fs.existsSync(fileName)){
        return reject(new Error('IAR file ' + fileName +  ' does not exist'));
      }

      return reject(new Error('Not Implemented'));
      //console.log('file must exist...');
      //resolve();
    })//.then( () => {
    //  throw new Error('Not Implemented');
    //  return null;
    //});
  }

  save(db: Sql): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      //push all of the inventory folders in first
      let folders = this.getFolders();
      let query = 'INSERT INTO inventoryfolders (folderName, type, version, folderID, agentID, parentFolderID) VALUES ?';
      let values = [];
      for (let f of folders) {
        values.push([f.folderName, f.Type, f.version, f.folderID.toString(), f.agentID.toString(), f.parentFolderID.toString()]);
      }
      db.pool.query(query, [values], (err) => {
        if (err) return reject(err);

        //once folders are inserted, insert items
        let items = this.getItems();
        let tasks = items.map((i: Item) => {
          if(i.assetID === undefined){
            console.log(i);
          }
          return new Promise<void>((resolve, reject) => {
            db.pool.query('INSERT INTO inventoryitems SET ?', {
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

  static Delete(db: Sql, id: UUIDString): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      db.pool.query('DELETE FROM inventoryfolders WHERE agentID=?', id.toString(), (err) => {
        if (err) return reject(err);

        db.pool.query('DELETE FROM inventoryitems WHERE avatarID=?', id.toString(), (err) => {
          if (err) return reject(err);

          resolve();
        });
      });
    });
  }

  static FromDB(db: Sql, id: UUIDString): Promise<Inventory> {
    return new Promise<Inventory>((resolve, reject) => {
      let folders: Folder[] = [];
      let items: Item[] = [];
      db.pool.query('SELECT * FROM inventoryfolders WHERE agentID=?', id.toString(), (err, rows) => {
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
        db.pool.query('SELECT * FROM inventoryitems WHERE avatarID=?', id.toString(), (err, rows) => {
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

  prettyPrint(){
    this.ppRecursion(this.root, '');
  }

  getRoot(): Folder {
    return this.root;
  }

  private ppRecursion(node: Folder, prefix: string){
    console.log(prefix + node.folderName);
    for(var i of node.items){
      console.log(prefix + '-' + i.inventoryName);
    }
    for(var f of node.children){
      this.ppRecursion(f, prefix + '\t');
    }
  }

  getFolders(): Folder[] {
    let folders: Folder[] = [];
    for(let k in this.folders){
      folders.push(this.folders[k]);
    }
    return folders;
  }

  getItems(): Item[] {
    let items: Item[] = [];
    for(let k in this.folders){
        for(let i of this.folders[k].items){
          items.push(i);
        }
    }
    return items;
  }

  static skeleton(owner: UUIDString): Inventory{
    let folders: Folder[] = [];
    let rootID = UUIDString.random();
    folders= [
      new Folder('My Inventory',  8, 0, rootID, owner, UUIDString.zero()),
      new Folder('Textures',      0, 0, UUIDString.random(), owner, rootID),
      new Folder('Sounds',        1, 0, UUIDString.random(), owner, rootID),
      new Folder('Calling Cards', 2, 0, UUIDString.random(), owner, rootID),
      new Folder('Landmarks',     3, 0, UUIDString.random(), owner, rootID),
      new Folder('Clothing',      5, 0, UUIDString.random(), owner, rootID),
      new Folder('Objects',       6, 0, UUIDString.random(), owner, rootID),
      new Folder('Notecards',     7, 0, UUIDString.random(), owner, rootID),
      new Folder('Scripts',       10, 0, UUIDString.random(), owner, rootID),
      new Folder('Body Parts',    13, 0, UUIDString.random(), owner, rootID),
      new Folder('Trash',         14, 0, UUIDString.random(), owner, rootID),
      new Folder('Photo Album',   15, 0, UUIDString.random(), owner, rootID),
      new Folder('Lost And Found', 16, 0, UUIDString.random(), owner, rootID),
      new Folder('Animations',    20, 0, UUIDString.random(), owner, rootID),
      new Folder('Gestures',      21, 0, UUIDString.random(), owner, rootID),
    ]
    return new Inventory(folders, []);
  }
}


export class Item {
  assetID: UUIDString
  assetType: number
  inventoryName: string
  inventoryDescription: string
  inventoryNextPermissions: number
  inventoryCurrentPermissions: number
  invType: number
  creatorID: UUIDString
  inventoryBasePermissions: number
  inventoryEveryOnePermissions: number
  salePrice: number
  saleType: number
  creationDate: number
  groupID: UUIDString
  groupOwned: number
  flags: number
  inventoryID: UUIDString
  avatarID: UUIDString
  parentFolderID: UUIDString
  inventoryGroupPermissions: number
}


export class Folder {
  folderName: string
  Type: number
  version: number
  folderID: UUIDString
  agentID: UUIDString
  parentFolderID: UUIDString
  items: Item[]
  children: Folder[]

  constructor(name: string, type: number, version: number, folderID: UUIDString, agentID: UUIDString, parentFolderID: UUIDString){
    this.folderName = name;
    this.Type = type;
    this.version = version;
    this.folderID = folderID;
    this.agentID = agentID;
    this.parentFolderID = parentFolderID;
    this.items = [];
    this.children = [];
  }
}
