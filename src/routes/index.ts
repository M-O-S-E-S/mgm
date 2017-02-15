
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
