
/// <reference path="../../typings/index.d.ts" />
/*
import * as Promise from 'bluebird';

import { PersistanceLayer } from './database';
import { Credential } from './auth/Credential';
import { WhipServer } from './whip/Whip';
import { UUIDString } from './util/UUID';
import { Asset } from './whip/asset';
import { SimianConnector } from './simian/Connector';

var conf = require('../settings.js');

let hal = new PersistanceLayer(conf.mgm.db, conf.halcyon.db);
let whip = new WhipServer(conf.whip);
let sim = new SimianConnector(conf.simian);

let args = process.argv.slice(2);

if (process.argv.length < 3) {
  throw new Error('simian sourceID and halcyon targetID required');
}

let targetID = new UUIDString(args[1]);
let sourceID = new UUIDString(args[0]);

let targetUser: UserInstance;
let sourceUser: UserInstance;
let sourceInventory: Inventory;

whip.connect().then(() => {
  return UserMgr.instance().getUser(targetID);
}).then((u: User) => {
  console.log('loading inventory onto halcyon account ' + u.getUsername() + ' ' + u.getLastName());
  targetUser = u;
  return sim.getUser(sourceID);
}).then((u: User) => {
  sourceUser = u;
  console.log('copying inventory from simian user ' + u.getUsername() + ' ' + u.getLastName() + ' to halcyon user ' + targetUser.getUsername() + ' ' + targetUser.getLastName());
  return sim.getInventory(u.getUUID().toString());
}).then((i: Inventory) => {
  sourceInventory = i;
  return Inventory.FromDB(hal, targetUser.getUUID());
}).then((i: Inventory) => {
  //both users are in good shape and we have both inventories
  console.log('Inventories retrieved.  Erasing current Halcyon inventory.');
  return Inventory.Delete(hal, targetUser.getUUID());
}).then(() => {
  //convert inventory for new owner
  console.log('Inserting new Halcyon inventory.');
  sourceInventory.changeOwner(targetUser.getUUID());
  return sourceInventory.save(hal);
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
}).then(() => {
  console.log('Complete');
  process.exit();
}).catch((err: Error) => {
  console.log('An Error occurred: ' + err.message);
  process.exit();
});

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
*/