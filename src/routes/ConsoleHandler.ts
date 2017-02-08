
import * as express from 'express';
import { UUIDString,RegionLogs, ConsoleCommand } from '../lib';
import { PersistanceLayer, RegionInstance, HostInstance } from '../database';
import { Config } from '../Config'; 

export function ConsoleHandler(db: PersistanceLayer, config: Config, isUser: any): express.Router {
  let router = express.Router();

  let logger = new RegionLogs(config.mgm.log_dir);

  router.post('/open/:uuid', isUser, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (!r.isRunning) {
        throw new Error('Region must be running to open a console');
      }
      res.cookie('console', 0);
      res.send(JSON.stringify({ Success: true, Prompt: r.name + ' >' }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/read/:uuid', isUser, (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    let regionID = new UUIDString(req.params.uuid);
    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (!r.isRunning) {
        throw new Error('Region is no longer running');
      }
      return logger.read(regionID, parseInt(req.cookies['console']));
    }).then((lines: string[]) => {
      res.cookie('console', parseInt(req.cookies['console']) + lines.length);
      res.send(JSON.stringify({ Success: true, Lines: lines }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/close/:uuid', isUser, (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    res.clearCookie('console');
    res.send(JSON.stringify({ Success: true }));
  });

  router.post('/write/:uuid', isUser, (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    let regionID = new UUIDString(req.params.uuid);
    let command: string = req.body.command;
    let region: RegionInstance;
    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (!r.isRunning) {
        throw new Error('Region is no longer running');
      }
      region = r;
      return db.Hosts.getByAddress(r.slaveAddress);
    }).then((h: HostInstance) => {
      return ConsoleCommand(region, h, command);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
