
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
import { EmailMgr } from './lib';
new EmailMgr(conf.mgm.mail);

let certificate = fs.readFileSync(conf.mgm.privateKeyPath)

import { getStore, Store } from './Store';
let store: Store = getStore(conf.mgm.db, conf.halcyon.db);

let clientApp = express();
clientApp.use(bodyParser.json({ limit: '1gb' }));       // to support JSON-encoded bodies
clientApp.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '1gb'
}));

clientApp.use(express.static(__dirname + '/public'));

// jwt and host ip validation middleware
import { Authorizer } from './Auth';
let middleware: Authorizer = new Authorizer(store, certificate);
let apiRouter = express.Router();

// multipart form parsing middleware
import * as multer from 'multer'
let formParser = multer().array('');

// Auth
import { RenewTokenHandler, LoginHandler } from './Routes';
apiRouter.get('/auth', middleware.isUser(), RenewTokenHandler(store, certificate));
apiRouter.post('/auth/login', formParser, LoginHandler(store, certificate));




// Jobs
import { GetJobsHandler, DeleteJobHandler, PasswordResetCodeHandler, PasswordResetHandler } from './Routes';
let uploadDir = conf.mgm.upload_dir;
let defaultOar = conf.mgm.default_oar_path;

//ensure the directory for logs exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdir(path.join(uploadDir), (err) => {
    if (err && err.code !== "EEXIST")
      throw new Error('Cannot create region log directory at ' + uploadDir);
  });
}

if (!fs.existsSync(defaultOar)) {
  throw new Error('Default oar does not exist at ' + defaultOar);
}
apiRouter.get('/job', middleware.isUser(), GetJobsHandler(store));
apiRouter.post('/job/delete/:id', formParser, middleware.isUser(), DeleteJobHandler(store));
apiRouter.post('/job/resetCode', formParser, PasswordResetCodeHandler(store, certificate));
apiRouter.post('/job/resetPassword', formParser, PasswordResetHandler(store, certificate));


// User
import { GetUsersHandler, SetPasswordHandler } from './Routes';
apiRouter.get('/user', middleware.isUser(), GetUsersHandler(store));
apiRouter.post('/user/password', middleware.isUser(), formParser, SetPasswordHandler(store));

// Region
import { GetRegionsHandler, GetRegionLogsHandler } from './Routes';
import { RegionLogs } from './lib';
let regionLogs = new RegionLogs(conf.mgm.log_dir);
apiRouter.get('/region', middleware.isUser(), GetRegionsHandler(store));
apiRouter.get('/region/logs/:uuid', middleware.isUser(), GetRegionLogsHandler(store, regionLogs));

// Estate
import { GetEstatesHandler, CreateEstateHandler, DeleteEstateHandler } from './Routes';
apiRouter.get('/estate', middleware.isUser(), GetEstatesHandler(store));
apiRouter.post('/estate/create', formParser, middleware.isAdmin(), CreateEstateHandler(store));
apiRouter.post('/estate/destroy/:id', middleware.isAdmin(), DeleteEstateHandler(store));

// Group
import { GetGroupsHandler, AddMemberHandler, RemoveMemberHandler } from './Routes';
apiRouter.get('/group', middleware.isUser(), GetGroupsHandler(store));
apiRouter.post('/group/addMember/:id', formParser, middleware.isAdmin(), AddMemberHandler(store));
apiRouter.post('/group/removeMember/:id', formParser, middleware.isAdmin(), RemoveMemberHandler(store));

// Host
import { GetHostHandler, AddHostHandler, RemoveHostHandler } from './Routes';
apiRouter.get('/host', middleware.isAdmin(), GetHostHandler(store));
apiRouter.post('/host/add', formParser, middleware.isAdmin(), AddHostHandler(store));
apiRouter.post('/host/remove', formParser, middleware.isAdmin(), RemoveHostHandler(store));


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


