
/// <reference path="../typings/index.d.ts" />

import * as Promise from 'bluebird';

import { SimianConnector } from './simian/Connector';
import { SqlConnector } from './halcyon/sqlConnector';
import { Sql } from './mysql/sql';
import { User, Appearance, Credential } from './halcyon/User';
import { Inventory, Folder, Item } from './halcyon/Inventory';
import { WhipServer } from './whip/Whip';
import { UUIDString } from './halcyon/UUID';
import { Asset } from './whip/asset';

var conf = require('../conf.json');

let sim = new SimianConnector(new Sql(conf.simian));
let hal = new SqlConnector(new Sql(conf.halcyon));
let whip = new WhipServer(conf.whip);

console.log('Starting...');

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
function migrateUser(id: UUIDString) {
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
}
