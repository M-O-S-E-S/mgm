
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as fs from 'fs';
import * as ini from 'ini';
import { install } from 'source-map-support';

install();

import { Config, BlankConfig, Validate } from './lib/Config';

let conf: Config = BlankConfig();
try {
  conf = ini.parse(fs.readFileSync('./mgm.ini').toString());
} catch (err) { }

// override any or all ini values with any env settings
conf = {
  mgmdb: {
    host: conf.mgmdb.host || process.env.MGM_DB_HOST,
    database: conf.mgmdb.database || process.env.MGM_DB_DATABASE,
    user: conf.mgmdb.user || process.env.MGM_DB_USER,
    password: conf.mgmdb.password || process.env.MGM_DB_PASS
  },
  haldb: {
    host: conf.haldb.host || process.env.HAL_DB_HOST,
    database: conf.haldb.database || process.env.HAL_DB_DATABASE,
    user: conf.haldb.user || process.env.HAL_DB_USER,
    password: conf.haldb.password || process.env.HAL_DB_PASS
  },
  main: {
    publicIP: conf.main.publicIP || process.env.PUBLIC_IP,
    lanIP: conf.main.lanIP || process.env.LAN_IP,
    log_dir: conf.main.log_dir || process.env.LOG_DIR,
    upload_dir: conf.main.upload_dir || process.env.UPLOAD_DIR,
    privateKeyPath: conf.main.privateKeyPath || process.env.PRIVATE_KEY
  },
  redis: { host: conf.redis.host || process.env.REDIS_HOST },
  freeswitch: { api_url: conf.freeswitch.api_url || process.env.FREESWITCH_API },
  offlinemessages: { api_url: conf.offlinemessages.api_url || process.env.OFFLINE_MESSAGES_API },
  templates: conf.templates || process.env.TEMPLATES ? JSON.parse(process.env.TEMPLATES) : null,
  mail: conf.mail || process.env.MAIL ? JSON.parse(process.env.MAIL) : null,
  halcyon: {
    grid_server: conf.halcyon.grid_server || process.env.GRID_SERVER,
    user_server: conf.halcyon.user_server || process.env.USER_SERVER,
    messaging_server: conf.halcyon.messaging_server || process.env.MESSAGING_SERVER,
    whip: conf.halcyon.whip || process.env.WHIP_SERVER
  },
  get_grid_info: {
    grid_name: conf.get_grid_info.grid_name || process.env.GRID_NAME,
    grid_nick: conf.get_grid_info.grid_nick || process.env.GRID_NICK,
    login_uri: conf.get_grid_info.login_uri || process.env.LOGIN_URI,
    manage: conf.get_grid_info.manage || process.env.MGM_PUBLIC_ADDRESS
  }
}

Validate(conf);

// initialize singletons
import { EmailMgr } from './lib';
new EmailMgr(conf.mail);

import { getStore, Store } from './lib/Store';
let store: Store = getStore(conf.mgmdb, conf.haldb);

import { Session } from './lib/Auth';
let session = new Session(conf.redis, store);


let clientApp = express();

clientApp.use(express.static(__dirname + '/public'));

// jwt and host ip validation middleware
import { Authorizer } from './lib/Auth';
let certificate = fs.readFileSync(conf.main.privateKeyPath)
let middleware: Authorizer = new Authorizer(store, session, certificate);
let apiRouter = express.Router();

// multipart form parsing middleware
import * as multer from 'multer'
let formParser = multer().array('');

// Auth
import { RenewTokenHandler, LoginHandler } from './lib/Routes/AuthHandler';
apiRouter.get('/auth', middleware.isUser(), RenewTokenHandler(store, session, certificate));
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
apiRouter.get('/job', middleware.isUser(), GetJobsHandler(store));
apiRouter.post('/job/delete/:id', formParser, middleware.isUser(), DeleteJobHandler(store));
apiRouter.post('/job/resetCode', formParser, PasswordResetCodeHandler(store, certificate));
apiRouter.post('/job/resetPassword', formParser, PasswordResetHandler(store, certificate));
apiRouter.post('/job/nukeContent/:uuid', middleware.isUser(), NukeContentHandler(store));
apiRouter.post('/job/loadOar/:uuid', middleware.isUser(), LoadOarHandler(store));
apiRouter.post('/job/upload/:id', middleware.isUser(), multer({ dest: uploadDir }).single('file'), UserUploadHandler(store));
apiRouter.post('/job/saveOar/:uuid', middleware.isUser(), SaveOarHandler(store));
apiRouter.get('/job/download/:id', middleware.isUser(), UserDownloadHandler(store));

// User
import {
  GetUsersHandler,
  SetPasswordHandler,
  SetAccessLevelHandler,
  SetEmailHandler,
  DeleteUserHandler,
  CreateUserHandler
} from './lib/Routes/UserHandler';
apiRouter.get('/user', middleware.isUser(), GetUsersHandler(store));
apiRouter.post('/user/password', middleware.isUser(), formParser, SetPasswordHandler(store));
apiRouter.post('/user/accessLevel', formParser, middleware.isAdmin(), SetAccessLevelHandler(store));
apiRouter.post('/user/email', formParser, middleware.isAdmin(), SetEmailHandler(store));
apiRouter.post('/user/destroy/:uuid', middleware.isAdmin(), DeleteUserHandler(store));
apiRouter.post('/user/create', formParser, middleware.isAdmin(), CreateUserHandler(store, conf.templates));


// Pending User
import { DenyPendingUserHandler, ApprovePendingUserHandler } from './lib/Routes/UserHandler';
apiRouter.post('/user/deny', formParser, middleware.isAdmin(), DenyPendingUserHandler(store));
apiRouter.post('/user/approve', formParser, middleware.isAdmin(), ApprovePendingUserHandler(store, conf.templates));

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
apiRouter.get('/region', middleware.isUser(), GetRegionsHandler(store));
apiRouter.post('/region/create', formParser, middleware.isAdmin(), CreateRegionHandler(store));
apiRouter.post('/region/destroy/:uuid', middleware.isAdmin(), DeleteRegionHandler(store));
apiRouter.get('/region/logs/:uuid', middleware.isUser(), GetRegionLogsHandler(store, regionLogs));
apiRouter.post('/region/start/:uuid', middleware.isUser(), StartRegionHandler(store));
apiRouter.post('/region/stop/:uuid', middleware.isUser(), StopRegionHandler(store));
apiRouter.post('/region/kill/:uuid', middleware.isUser(), KillRegionHandler(store));
apiRouter.post('/region/estate/:uuid', formParser, middleware.isUser(), SetRegionEstateHandler(store));
apiRouter.post('/region/setXY/:uuid', formParser, middleware.isUser(), SetRegionCoordinatesHandler(store));
apiRouter.post('/region/host/:uuid', formParser, middleware.isUser(), SetRegionHostHandler(store));

// Estate
import { GetEstatesHandler, CreateEstateHandler, DeleteEstateHandler } from './lib/Routes/EstateHandler';
apiRouter.get('/estate', middleware.isUser(), GetEstatesHandler(store));
apiRouter.post('/estate/create', formParser, middleware.isAdmin(), CreateEstateHandler(store));
apiRouter.post('/estate/destroy/:id', middleware.isAdmin(), DeleteEstateHandler(store));

// Group
import { GetGroupsHandler, AddMemberHandler, RemoveMemberHandler } from './lib/Routes/GroupHandler';
apiRouter.get('/group', middleware.isUser(), GetGroupsHandler(store));
apiRouter.post('/group/addMember/:id', formParser, middleware.isAdmin(), AddMemberHandler(store));
apiRouter.post('/group/removeMember/:id', formParser, middleware.isAdmin(), RemoveMemberHandler(store));

// Host
import { GetHostHandler, AddHostHandler, RemoveHostHandler } from './lib/Routes/HostHandler';
apiRouter.get('/host', middleware.isAdmin(), GetHostHandler(store));
apiRouter.post('/host/add', formParser, middleware.isAdmin(), AddHostHandler(store));
apiRouter.post('/host/remove', formParser, middleware.isAdmin(), RemoveHostHandler(store));

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

clientApp.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

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
  RegionConfigHandler,
  IniConfigHandler,
  NodeDownloadHandler,
  NodeReportHandler,
  NodeUploadHandler
} from './lib/Routes/NodeHandler';

clusterApp.get('/', (req, res) => { res.send('MGM Node Portal'); });

clusterApp.post('/logs/:uuid', NodeLogHandler(store, regionLogs));
clusterApp.post('/node', NodeHandler(store));
clusterApp.post('/stats', formParser, NodeStatHandler(store));
clusterApp.get('/region/:id', RegionConfigHandler(store));
clusterApp.get('/process/:id', IniConfigHandler(store, conf));
clusterApp.get('/ready/:id', NodeDownloadHandler(store, path.join(conf.main.upload_dir, '00000000-0000-0000-0000-000000000000')));
clusterApp.post('/report/:id', NodeReportHandler(store));
clusterApp.post('/upload/:id', multer({ dest: uploadDir }).single('file'), NodeUploadHandler(store));

clusterApp.listen(3001, function () {
  console.log('MGM listening for nodes on port 3001!');
});


