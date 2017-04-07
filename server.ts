
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as fs from 'fs';
import { install } from 'source-map-support';

install();

import { Config, LoadConfig } from './lib/Config';
let conf: Config = LoadConfig('./mgm.ini');


import { getStore, Store } from './lib/Store';
let store: Store = getStore(conf.mgmdb, conf.haldb);

import { Session } from './lib/Auth';
let session = new Session(conf.redis, store);

import { PerformanceStore } from './lib/Performance';
let perfData = new PerformanceStore(conf.redis);


let clientApp = express();

// jwt and host ip validation middleware
import { Authorizer } from './lib/Auth';
let certificate = fs.readFileSync(conf.main.privateKeyPath)
let middleware: Authorizer = new Authorizer(store, session, certificate);
let apiRouter = express.Router();
let checkUser = middleware.isUser();
let checkAdmin = middleware.isAdmin();

// initialize singletons
import { EmailMgr } from './lib';
new EmailMgr(conf.mail);
import { HalcyonJWT } from './lib/Auth';
new HalcyonJWT(certificate);

// multipart form parsing middleware
import * as multer from 'multer'
let formParser = multer().array('');

// Auth
import { RenewTokenHandler, LoginHandler } from './lib/Routes/AuthHandler';
apiRouter.get('/auth', checkUser, RenewTokenHandler(store, session, certificate));
apiRouter.post('/auth/login', formParser, LoginHandler(store, session, certificate));

// Registration
import { RegisterHandler } from './lib/Routes/RegisterHandler';
apiRouter.post('/register', formParser, RegisterHandler(store, conf.templates));


// Jobs
import {
  GetJobsHandler,
  DeleteJobHandler,
  PasswordResetCodeHandler,
  PasswordResetHandler,
  NukeContentHandler,
  LoadOarHandler,
  SaveOarHandler,
  UserUploadHandler,
  UserDownloadHandler
} from './lib/Routes/JobHandler';
let uploadDir = conf.main.upload_dir;

//ensure the directory for logs exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdir(path.join(uploadDir), (err) => {
    if (err && err.code !== "EEXIST")
      throw new Error('Cannot create region log directory at ' + uploadDir);
  });
}
apiRouter.get('/job', checkUser, GetJobsHandler(store));
apiRouter.post('/job/delete/:id', formParser, checkUser, DeleteJobHandler(store));
apiRouter.post('/job/resetCode', formParser, PasswordResetCodeHandler(store, certificate));
apiRouter.post('/job/resetPassword', formParser, PasswordResetHandler(store, certificate));
apiRouter.post('/job/nukeContent/:uuid', checkUser, NukeContentHandler(store, perfData, path.join(conf.main.upload_dir, '00000000-0000-0000-0000-000000000000') ));
apiRouter.post('/job/loadOar/:uuid', checkUser, LoadOarHandler(store, perfData));
apiRouter.post('/job/upload/:id', checkUser, multer({ dest: uploadDir }).single('file'), UserUploadHandler(store, perfData));
apiRouter.post('/job/saveOar/:uuid', checkUser, SaveOarHandler(store, perfData));
apiRouter.get('/job/download/:id', checkUser, UserDownloadHandler(store, conf.main.upload_dir));

// User
import {
  GetUsersHandler,
  SetPasswordHandler,
  SetAccessLevelHandler,
  SetEmailHandler,
  DeleteUserHandler,
  CreateUserHandler
} from './lib/Routes/UserHandler';
apiRouter.get('/user', checkUser, GetUsersHandler(store));
apiRouter.post('/user/password', checkUser, formParser, SetPasswordHandler(store));
apiRouter.post('/user/accessLevel', formParser, checkAdmin, SetAccessLevelHandler(store));
apiRouter.post('/user/email', formParser, checkAdmin, SetEmailHandler(store));
apiRouter.post('/user/destroy/:uuid', checkAdmin, DeleteUserHandler(store));
apiRouter.post('/user/create', formParser, checkAdmin, CreateUserHandler(store, conf.templates));


// Pending User
import { DenyPendingUserHandler, ApprovePendingUserHandler } from './lib/Routes/UserHandler';
apiRouter.post('/user/deny', formParser, checkAdmin, DenyPendingUserHandler(store));
apiRouter.post('/user/approve', formParser, checkAdmin, ApprovePendingUserHandler(store, conf.templates));

// Region
import {
  GetRegionsHandler,
  GetRegionLogsHandler,
  StartRegionHandler,
  StopRegionHandler,
  KillRegionHandler,
  SetRegionEstateHandler,
  SetRegionCoordinatesHandler,
  SetRegionHostHandler,
  CreateRegionHandler,
  DeleteRegionHandler
} from './lib/Routes/RegionHandler';
import { RegionLogs } from './lib';
let regionLogs = new RegionLogs(conf.main.log_dir);
apiRouter.get('/region', checkUser, GetRegionsHandler(store, perfData));
apiRouter.post('/region/create', formParser, checkAdmin, CreateRegionHandler(store));
apiRouter.post('/region/destroy/:uuid', checkAdmin, DeleteRegionHandler(store, perfData));
apiRouter.get('/region/logs/:uuid', checkUser, GetRegionLogsHandler(store, regionLogs));
apiRouter.post('/region/start/:uuid', checkUser, StartRegionHandler(store, conf));
apiRouter.post('/region/stop/:uuid', checkUser, StopRegionHandler(store, perfData));
apiRouter.post('/region/kill/:uuid', checkUser, KillRegionHandler(store, perfData));
apiRouter.post('/region/estate/:uuid', formParser, checkUser, SetRegionEstateHandler(store));
apiRouter.post('/region/setXY/:uuid', formParser, checkUser, SetRegionCoordinatesHandler(store, perfData));
apiRouter.post('/region/host/:uuid', formParser, checkUser, SetRegionHostHandler(store, perfData));

// Estate
import { GetEstatesHandler, CreateEstateHandler, DeleteEstateHandler } from './lib/Routes/EstateHandler';
apiRouter.get('/estate', checkUser, GetEstatesHandler(store));
apiRouter.post('/estate/create', formParser, checkAdmin, CreateEstateHandler(store));
apiRouter.post('/estate/destroy/:id', checkAdmin, DeleteEstateHandler(store));

// Group
import { GetGroupsHandler, AddMemberHandler, RemoveMemberHandler } from './lib/Routes/GroupHandler';
apiRouter.get('/group', checkUser, GetGroupsHandler(store));
apiRouter.post('/group/addMember/:id', formParser, checkAdmin, AddMemberHandler(store));
apiRouter.post('/group/removeMember/:id', formParser, checkAdmin, RemoveMemberHandler(store));

// Host
import { GetHostHandler, AddHostHandler, RemoveHostHandler } from './lib/Routes/HostHandler';
apiRouter.get('/host', checkAdmin, GetHostHandler(store, perfData));
apiRouter.post('/host/add', formParser, checkAdmin, AddHostHandler(store));
apiRouter.post('/host/remove', formParser, checkAdmin, RemoveHostHandler(store));

clientApp.use('/api', apiRouter);

clientApp.get('/get_grid_info', (req, res) => {
  let grid_info = conf.get_grid_info;
  res.send('<?xml version="1.0"?><gridinfo><login>' +
    grid_info.login_uri +
    '</login><register>' +
    grid_info.manage +
    '</register><welcome>' +
    grid_info.manage + '\welcome.html' +
    '</welcome><password>' +
    grid_info.manage +
    '</password><gridname>' +
    grid_info.grid_name +
    '</gridname><gridnick>' +
    grid_info.grid_nick +
    '</gridnick><about>' +
    grid_info.manage +
    '</about><economy>' +
    grid_info.manage +
    '</economy></gridinfo>');
});

clientApp.listen(3000, function () {
  console.log('MGM listening for clients on port 3000!');
});





let clusterApp = express();
clusterApp.use(bodyParser.json({ limit: '1gb' }));       // to support JSON-encoded bodies
clusterApp.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '1gb'
}));

import {
  NodeLogHandler,
  NodeHandler,
  NodeStatHandler,
  NodeDownloadHandler,
  NodeReportHandler,
  NodeUploadHandler
} from './lib/Routes/NodeHandler';

clusterApp.get('/', (req, res) => { res.send('MGM Node Portal'); });

clusterApp.post('/logs/:uuid', NodeLogHandler(store, regionLogs));
clusterApp.post('/node', NodeHandler(store));
clusterApp.post('/stats', formParser, NodeStatHandler(store, perfData));
clusterApp.get('/ready/:id', NodeDownloadHandler(store, path.join(conf.main.upload_dir, '00000000-0000-0000-0000-000000000000')));
clusterApp.post('/report/:id', NodeReportHandler(store));
clusterApp.post('/upload/:id', multer({ dest: uploadDir }).single('file'), NodeUploadHandler(store));

clusterApp.listen(3001, function () {
  console.log('MGM listening for nodes on port 3001!');
});
