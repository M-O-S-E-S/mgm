
import * as express from 'express';
import { UUIDString } from '../../halcyon/UUID';
import { RestConsole, ConsoleSession } from '../console';
import { Region } from '../Region';

import { MGM } from '../MGM';

export interface ConsoleSettings {
  user: string,
  pass: string
}

export function ConsoleHandler(mgm: MGM, settings: ConsoleSettings): express.Router{
  let router = express.Router();

  router.post('/open/:uuid', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    let regionID = new UUIDString(req.params.uuid);
    mgm.getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region must be running to open a console');
      }
      return RestConsole.open(r.slaveAddress, r.consolePort, settings.user, settings.pass);
    }).then((session: ConsoleSession) => {
      res.cookie('console', session);
      res.send(JSON.stringify({ Success: true, Prompt: session.prompt }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/read/:uuid', (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    let regionID = new UUIDString(req.params.uuid);
    mgm.getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region is no longer running');
      }
      return RestConsole.read(req.cookies['console']);
    }).then((lines) => {
      res.send(JSON.stringify({ Success: true, Lines: lines }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/close/:uuid', (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    let regionID = new UUIDString(req.params.uuid);
    mgm.getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region is no longer running');
      }
      return RestConsole.close(req.cookies['console']);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/write/:uuid', (req, res) => {
    if (!req.cookies['console']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }
    let regionID = new UUIDString(req.params.uuid);
    let command: string = req.body.command;
    mgm.getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region is no longer running');
      }
      return RestConsole.write(req.cookies['console'], command);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
