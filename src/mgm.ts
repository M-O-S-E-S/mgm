
/// <reference path="../typings/index.d.ts" />

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from "path";

import { Sql } from './mysql/sql';
import { MGM } from './mgm/MGM';
import { User } from './halcyon/User';
import { Host } from './mgm/host';
import { UUIDString } from './halcyon/UUID';
import { Job } from './mgm/Job';
import { Region } from './mgm/Region';
import { Estate } from './halcyon/estate';
import { Group } from './halcyon/Group';

var conf = require('../settings.js');

let mgm = new MGM(conf);

let app = express();

var cookieParser = require('cookie-parser')
app.use(cookieParser('super-secret-cookie-session-key!!!1!'));

//var bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '1gb' }));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '1gb'
}));

app.use('/', mgm.getRouter());

/*
app.get('/', (req, res) => {
  res.send('MGM');
});

app.get('/get_grid_info', (req, res) => {
  res.send('<?xml version="1.0"?><gridinfo><login>' +
    conf.grid_info.login +
    '</login><register>' +
    conf.grid_info.mgm +
    '</register><welcome>' +
    conf.grid_info.mgm + '\welcome.html' +
    '</welcome><password>' +
    conf.grid_info.mgm +
    '</password><gridname>' +
    conf.grid_info.gridName +
    '</gridname><gridnick>' +
    conf.grid_info.gridNick +
    '</gridnick><about>' +
    conf.grid_info.mgm +
    '</about><economy>' +
    conf.grid_info.mgm +
    '</economy></gridinfo>');
});

app.get('/region/logs/:uuid', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  let regionID = new UUIDString(req.params.uuid);
  mgm.getRegion(regionID).then((r: Region) => {
    res.sendFile(path.join(__dirname, 'log', r.name));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.get('/map/regions', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  mgm.getAllRegions().then((regions: Region[]) => {
    let result = [];
    for (let r of regions) {
      result.push({
        Name: r.name,
        x: r.locX,
        y: r.locY
      })
    }
    res.send(JSON.stringify(result));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/register/submit', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

*/

app.listen(3000, function() {
  console.log('MGM listening on port 3000!');
});
