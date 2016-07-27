
import * as express from 'express';
import { UUIDString } from '../../halcyon/UUID';
import { Region, RegionMgr } from '../Region';
import { Host, HostMgr } from '../Host';

import { RegionLogs } from '../util/regionLogs';

import { MGM } from '../MGM';

export function ConsoleHandler(mgm: MGM): express.Router {
  let router = express.Router();

  let logs = RegionLogs.instance();

  router.post('/open/:uuid', MGM.isUser, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (!r.isRunning()) {
        throw new Error('Region must be running to open a console');
      }
      res.cookie('console', 0);
      res.send(JSON.stringify({ Success: true, Prompt: r.getName() + ' >' }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/read/:uuid', MGM.isUser, (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    let regionID = new UUIDString(req.params.uuid);
    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region is no longer running');
      }
      return logs.read(regionID, parseInt(req.cookies['console']));
    }).then((lines: string[]) => {
      res.cookie('console', parseInt(req.cookies['console']) + lines.length);
      res.send(JSON.stringify({ Success: true, Lines: lines }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/close/:uuid', MGM.isUser, (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    res.clearCookie('console');
    res.send(JSON.stringify({ Success: true }));
  });

  router.post('/write/:uuid', MGM.isUser, (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    let regionID = new UUIDString(req.params.uuid);
    let command: string = req.body.command;
    let region: Region;
    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region is no longer running');
      }
      region = r;
      return HostMgr.instance().get(r.getNodeAddress());
    }).then((h: Host) => {
      return mgm.consoleCommand(region, h, command);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
