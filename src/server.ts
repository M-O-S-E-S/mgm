
/// <reference path="../typings/index.d.ts" />

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as fs from 'fs';

//import { SetupRoutes } from './routes';
import { Config, Validate } from './Config';

let conf: Config = require('../settings.js');
if (!Validate(conf)) {
  process.exit(1);
}

//initialize singletons
//import { EmailMgr } from './lib';
//new EmailMgr(conf.mgm.mail);

let certificate = fs.readFileSync(conf.mgm.privateKeyPath)

import { getStore, Store } from './Store';
let store: Store = getStore(conf.mgm.db,conf.halcyon.db);

let clientApp = express();
clientApp.use(bodyParser.json({ limit: '1gb' }));       // to support JSON-encoded bodies
clientApp.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '1gb'
}));

clientApp.use(express.static(__dirname + '/public'));

import { Authorizer } from './Network';
let middleware: Authorizer = new Authorizer(store, certificate);
let apiRouter = express.Router();

// Auth
import { RenewTokenHandler } from './Network';
apiRouter.get('/auth', middleware.isUser(), RenewTokenHandler(store, certificate));

// Jobs
import { GetJobsHandler } from './Network';
apiRouter.get('/job', middleware.isUser(), GetJobsHandler(store));

// User
import { GetUsersHandler } from './Network';
apiRouter.get('/user', middleware.isUser(), GetUsersHandler(store));

// Region
import { GetRegionsHandler } from './Network';
apiRouter.get('/region', middleware.isUser(), GetRegionsHandler(store));

// Estate
import { GetEstatesHander } from './Network';
apiRouter.get('/estate', middleware.isUser(), GetEstatesHander(store));

// Group
import { GetGroupsHander } from './Network';
apiRouter.get('/group', middleware.isUser(), GetGroupsHander(store));



clientApp.use('/api', apiRouter);

clientApp.get('/get_grid_info', (req, res) => {
  let grid_info = conf.grid_info;
  res.send('<?xml version="1.0"?><gridinfo><login>' +
    grid_info.login +
    '</login><register>' +
    grid_info.mgm +
    '</register><welcome>' +
    grid_info.mgm + '\welcome.html' +
    '</welcome><password>' +
    grid_info.mgm +
    '</password><gridname>' +
    grid_info.gridName +
    '</gridname><gridnick>' +
    grid_info.gridNick +
    '</gridnick><about>' +
    grid_info.mgm +
    '</about><economy>' +
    grid_info.mgm +
    '</economy></gridinfo>');
});

clientApp.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

clientApp.listen(3000, function () {
  console.log('MGM listening for clients on port 3000!');
});





let clusterApp = express();
clientApp.listen(3001, function () {
  console.log('MGM listening for nodes on port 3001!');
});


