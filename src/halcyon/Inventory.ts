
import { UUIDString } from './UUID';

import fs = require("fs");

export class Inventory {
  private root: Folder
  private folders: {[key:string]: Folder}

  constructor(folders: Folder[], items: Item[]){
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

  changeOwner(u: UUIDString) {
    for(let key in this.folders){
      let f = this.folders[key];
      f.agentID = u;
      for( let ch of f.children){
        ch.agentID = u;
      }
    }
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
