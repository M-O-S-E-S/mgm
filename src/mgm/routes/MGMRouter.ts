
import * as express from 'express';
import { Freeswitch } from '../util/Freeswitch';

import { MGM } from '../MGM';
import { Region, RegionMgr } from '../Region';

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
import { FreeswitchHandler } from './FreeswitchHandler';

export function SetupRoutes(mgm: MGM, voiceIP: string): express.Router{
  let router = express.Router();
  let fs = new Freeswitch(voiceIP);

  router.use('/auth', AuthHandler());
  router.use('/console', ConsoleHandler(mgm));
  router.use('/task', TaskHandler(mgm));
  router.use('/estate', EstateHandler());
  router.use('/host', HostHandler(mgm));
  router.use('/user', UserHandler(mgm.getTemplates()));
  router.use('/region', RegionHandler(mgm));
  router.use('/group', GroupHandler());

  router.use('/fsapi', FreeswitchHandler(fs));

  router.use('/offline', OfflineMessageHandler());

  router.use('/server/dispatch', DispatchHandler(mgm));

  router.get('/', (req, res) => {
    res.send('MGM');
  });

  router.get('/get_grid_info', (req, res) => {
    res.send('<?xml version="1.0"?><gridinfo><login>' +
      this.conf.grid_info.login +
      '</login><register>' +
      this.conf.grid_info.mgm +
      '</register><welcome>' +
      this.conf.grid_info.mgm + '\welcome.html' +
      '</welcome><password>' +
      this.conf.grid_info.mgm +
      '</password><gridname>' +
      this.conf.grid_info.gridName +
      '</gridname><gridnick>' +
      this.conf.grid_info.gridNick +
      '</gridnick><about>' +
      this.conf.grid_info.mgm +
      '</about><economy>' +
      this.conf.grid_info.mgm +
      '</economy></gridinfo>');
  });

  router.get('/map/regions', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    RegionMgr.instance().getAllRegions().then((regions: Region[]) => {
      let result = [];
      for (let r of regions) {
        result.push({
          Name: r.getName(),
          x: r.getX(),
          y: r.getY()
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
