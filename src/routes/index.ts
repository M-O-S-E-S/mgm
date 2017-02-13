
import * as express from 'express';
import { Freeswitch, FreeswitchHandler } from '../Freeswitch';
import { PersistanceLayer, RegionInstance } from '../database';

import { AuthHandler } from './AuthHandler';
import { ConsoleHandler } from './ConsoleHandler';
import { TaskHandler } from './TaskHandler';
import { EstateHandler } from './EstateHandler';
import { HostHandler } from './HostHandler';
import { UserHandler } from './UserHandler';
import { RegionHandler } from './RegionHandler';
import { GroupHandler } from './GroupHandler';
import { DispatchHandler } from './DispatchHandler';
import { OfflineMessageHandler } from './OfflineMessageHandler';
import { RegisterHandler } from './RegisterHandler';

import { Config } from '../Config';

import * as jwt from 'jsonwebtoken';
import * as multer from 'multer';

export interface UserDetail {
  name: string
  uuid: string
  godLevel: number
  email: string
}

class Authorizer {
  private db: PersistanceLayer
  private cert: Buffer

  constructor(database: PersistanceLayer, cert: Buffer) {
    this.db = database;
    this.cert = cert;
  }

  isUser() {
    return this._isUser.bind(this);
  }

  private _isUser(req, res, next) {
    let token = req.headers['x-access-token'];
    jwt.verify(token, this.cert, (err: Error, decoded: UserDetail) => {
      if (err) {
        return res.send(JSON.stringify({ Success: false, Message: err.message }));
      }
      req.user = decoded;
      return next();
    });
  }

  isAdmin() {
    return this._isAdmin.bind(this);
  }

  private _isAdmin(req, res, next) {
    let token = req.headers['x-access-token'];
    jwt.verify(token, this.cert, (err: Error, decoded: UserDetail) => {
      if (err) {
        return res.send(JSON.stringify({ Success: false, Message: err.message }));
      }
      if (decoded.godLevel >= 250) {
        req.user = decoded;
        return next();
      }

      return res.send(JSON.stringify({ Success: false, Message: 'Access Denied' }));
    });
  }

  isNode() {
    return this._isNode.bind(this);
  }

  private _isNode(req, res, next) {
    let remoteIP: string = req.ip.split(':').pop();
    this.db.Hosts.getByAddress(remoteIP).then(() => {
      return next();
    }).catch(() => {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    });
  }
}

export function SetupRoutes(conf: Config): express.Router {
  let db = new PersistanceLayer(conf.mgm.db, conf.halcyon.db);

  let gatekeeper = new Authorizer(db, conf.mgm.certificate);

  let router = express.Router();
  let fs = new Freeswitch(conf.mgm.voiceIP);

  router.use('/auth', AuthHandler(db, conf.mgm.certificate, gatekeeper.isUser()));
  router.use('/console', ConsoleHandler(db, conf, gatekeeper.isUser()));
  router.use('/task', multer().array(''), TaskHandler(db, conf, gatekeeper.isUser(), gatekeeper.isAdmin()));
  router.use('/estate', EstateHandler(db, gatekeeper.isUser(), gatekeeper.isAdmin()));
  router.use('/host', HostHandler(db, gatekeeper.isUser(), gatekeeper.isAdmin()));
  router.use('/user', UserHandler(db, conf.mgm.templates, gatekeeper.isUser(), gatekeeper.isAdmin()));
  router.use('/region', RegionHandler(db, conf, gatekeeper.isUser(), gatekeeper.isAdmin()));
  router.use('/group', GroupHandler(db, gatekeeper.isUser(), gatekeeper.isAdmin()));

  router.use('/fsapi', FreeswitchHandler(fs, gatekeeper.isNode()));

  router.use('/offline', OfflineMessageHandler(db));
  router.use('/register', RegisterHandler(db, conf.mgm.templates));

  router.use('/dispatch', DispatchHandler(db, conf));

  router.get('/', (req, res) => {
    res.send('MGM');
  });

  router.get('/map/regions', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    db.Regions.getAll().then((regions: RegionInstance[]) => {
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

  router.post('/register/submit', (req, res) => {
    console.log('Received registration request.  Not Implemented');
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  return router;
}
