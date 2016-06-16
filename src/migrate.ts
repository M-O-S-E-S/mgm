
/// <reference path="../typings/index.d.ts" />

import * as Promise from 'bluebird';

import { SqlConnector } from './halcyon/sqlConnector';
import { User, Appearance, Credential } from './halcyon/User';
import { Inventory, Folder, Item } from './halcyon/Inventory';
import { WhipServer } from './whip/Whip';
import { UUIDString } from './halcyon/UUID';
import { Asset } from './whip/asset';
import { SimianConnector } from './simian/Connector';

var conf = require('../settings.js');

let hal = new SqlConnector(conf.halcyon);
let whip = new WhipServer(conf.whip);
let sim = new SimianConnector(conf.simian);

let args = process.argv.slice(2);

if (process.argv.length < 3) {
  throw new Error('simian sourceID and halcyon targetID required');
}

let targetID = new UUIDString(args[1]);
let sourceID = new UUIDString(args[0]);

let targetUser: User;
let sourceUser: User;
let sourceInventory: Inventory;

whip.connect().then(() => {
  return hal.getUser(targetID);
}).then((u: User) => {
  console.log('loading inventory onto halcyon account ' + u.username + ' ' + u.lastname);
  targetUser = u;
  return sim.getUser(sourceID);
}).then((u: User) => {
  sourceUser = u;
  console.log('copying inventory from simian user ' + u.username + ' ' + u.lastname + ' to halcyon user ' + targetUser.username + ' ' + targetUser.lastname);
  return sim.getInventory(u.UUID.toString());
}).then((i: Inventory) => {
  sourceInventory = i;
  return hal.getInventory(targetUser.UUID);
}).then((i: Inventory) => {
  //both users are in good shape and we have both inventories
  console.log('Inventories retrieved.  Erasing current Halcyon inventory.');
  return hal.deleteInventory(targetUser);
}).then(() => {
  //convert inventory for new owner
  console.log('Inserting new Halcyon inventory.');
  sourceInventory.changeOwner(targetUser.UUID);
  return hal.addInventory(sourceInventory);
}).then(() => {
  //the target account contains all of the folder and item references, now to collect and upload assets
  let items = sourceInventory.getItems();
  console.log('Inventory switch complete.  Uploading ' + items.length + ' assets');

  let counter = 1;

  let w = Promise.resolve();
  for(let i of items){
    w = w.then( () => {
      return sim.getAsset(i.assetID);
    }).then( (a: Asset) => {
      if(a === null){
        return 'Asset ' + i.assetID + ' Does not exist in simian';
      }
      a.name = i.inventoryName;
      a.description = i.inventoryDescription;
      return whip.testAsset(a.uuid).then( (res) => {
        if(res === null){
          console.log('Uploading asset ' + a.uuid.toString() + ' to whip');
          return whip.putAsset(a);
        }
        return 'Asset ' + a.uuid.toString() + ' is already on whip, skipping';
      })
    }).then( (msg: string) => {
      console.log( counter + '/' + items.length + ': ' + msg);
      counter++;
    });
  }

  return w;

  /*let counter = 1;
  return Promise.all(items.map( (i: Item ) => {
    return sim.getAsset(i.assetID).then((a: Asset) => {
      if(a === null) return "Asset does not exist in simian";
      a.name = i.inventoryName;
      a.description = i.inventoryDescription;
      return whip.putAsset(a);
    }).then((res: string) => {
      console.log( counter + '/' + items.length + ': asset loaded: ' + res);
      counter++;
    })//.catch((err: Error) => {
    //  console.log( counter + '/' + items.length + ': ' + err.message);
    //  counter++;
    //  resolve();
    //});

  }));*/
}).then(() => {
  console.log('Complete');
  process.exit();
}).catch((err: Error) => {
  console.log('An Error occurred: ' + err.message);
  process.exit();
});

/********* LOAD IAR ***************
let user: User;

hal.getUser(targetID).then( (u: User) => {
  console.log('loading iar onto user account ' + u.username + ' ' + u.lastname);
  user = u;
  return Inventory.FromIar(iarFile);
}).then( (i: Inventory) => {


  console.log('parsed inventory');
}).catch((err: Error) => {
  console.log('An Error occurred: ' + err.message);
  process.exit();
});

console.log('Migrating iarfile ' + iarFile + ' merging inventory for ' + targetID);

*/

let totalAssets: number = 0;
let assetMap: { [key: string]: number } = {}

function testAssetSerialization() {
  let asset: Asset = new Asset(
    new UUIDString('f09d85c6-17a3-11e6-b6ba-3e1d05defe79'),
    10, //lsl text
    true, //is local
    true, //is temporary
    500,  //created timestamp
    "Monty Python's Holy Quote",
    "this is the description of this object",
    new Buffer('Camelot tis a silly place.  Let\'s not go there.'));

  let serializedBuffer = asset.serialize();
  let rAsset = Asset.fromBuffer(serializedBuffer);
  if (asset.uuid.toString() !== rAsset.uuid.toString())
    console.log('uuid does not match');
  if (asset.type !== rAsset.type)
    console.log('type does not match');
  if (asset.local !== rAsset.local)
    console.log('local does not match');
  if (asset.temporary !== rAsset.temporary)
    console.log('temporary does not match');
  if (asset.createTime !== rAsset.createTime)
    console.log('createTime does not match');
  if (asset.name.toString() !== rAsset.name.toString())
    console.log('name does not match');
  if (asset.description.toString() !== rAsset.description.toString())
    console.log('description does not match');
  if (asset.data.compare(rAsset.data) !== 0)
    console.log('data does not match');
}

function testReadAssets() {
  whip.connect().then(() => {
    console.log('connected to whip');
    return whip.getAllAssetIDs();
  }).then((ids: UUIDString[]) => {
    console.log('received ' + ids.length + ' ids');
    let workers = [];
    for (let id of ids) {
      let w = whip.getAsset(id).then((a: Asset) => {
        console.log(a.toString());
        console.log(a.data.toString());
      });
      workers.push(w);
    }
    return Promise.all(workers);
  }).catch((err: Error) => {
    console.log(err.stack);
  }).finally(() => {
    console.log('testReadAssets Complete');
  });
}

function testLoadAsset() {
  let asset: Asset = new Asset(
    new UUIDString('f09d85c6-17a3-11e6-b6ba-3e1d05defe79'),
    10, //lsl text
    true, //is local
    true, //is temporary
    500,  //created timestamp
    "Monty Python's Holy Quote",
    "this is the description of this object",
    new Buffer('Camelot tis a silly place.  Let\'s not go there.'));

  whip.connect().then(() => {
    return whip.putAsset(asset);
  }).then(() => {
    return whip.getAsset(asset.uuid);
  }).then((a: Asset) => {
    console.log('Sent asset:');
    console.log(asset);
    console.log('Received asset:');
    console.log(a);
  }).catch((err) => {
    console.log('Error: ' + err);
  }).finally(() => {
    console.log('testLoadAsset Complete');
  })
}

//incomplete, does not copy inventory or any other information, just username and password
/*function migrateUser(id: UUIDString) {
  whip.connect().then(() => {
    return sim.getUser(id);
  }).then((user: User) => {




    return hal.addUser(user);
  }).then(() => {
    console.log('user migrated, creating skeleton inventory');
    return hal.addInventory(Inventory.skeleton(id));
  }).then(() => {
    console.log('complete');
    process.exit();
  }).catch((err: Error) => {
    console.log(err.stack);
  });
}

function migrateUsers() {
  //we are already connected to the simian database
  //initiate connection to the whip server
  let owner = UUIDString.random()
  console.log(owner.toString());
  let inv = Inventory.skeleton(owner);
  inv.prettyPrint();
}*/
