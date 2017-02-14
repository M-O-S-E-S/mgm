
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
import { Set } from 'immutable';

/**
 * The user detail is the body of the JWT tokens.
 * Nothing secret or secure should be in here.
 * 
 * This token also contains the estate IDs and region UUIDs that they have permission over.
 */
export interface UserDetail {
  name: string
  uuid: string
  isAdmin: boolean
  email: string
  estates: Set<number>
  regions: Set<string>
}

export interface AuthenticatedRequest extends express.Request {
  user: UserDetail
  body?: any
  params: any
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

  private _isUser(req: AuthenticatedRequest, res, next) {
    let token = req.headers['x-access-token'];
    jwt.verify(token, this.cert, (err: Error, decoded: UserDetail) => {
      if (err) {
        return res.json({ Success: false, Message: err.message });
      }
      req.user = decoded;
      // convert javascript arrays into Sets
      req.user.estates = Set<number>(req.user.estates);
      req.user.regions = Set<string>(req.user.regions);
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
        return res.json({ Success: false, Message: err.message });
      }
      if (decoded.isAdmin) {
        req.user = decoded;
        return next();
      }

      return res.json({ Success: false, Message: 'Access Denied' });
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
      return res.json({ Success: false, Message: 'Permission Denied' });
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
      res.json({ Success: false, Message: 'No session found' });
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
      res.json(result);
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  return router;
}
