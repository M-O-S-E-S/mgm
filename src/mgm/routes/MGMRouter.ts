
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

  let grid_info = mgm.getGridInfo();
  router.get('/get_grid_info', (req, res) => {
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
