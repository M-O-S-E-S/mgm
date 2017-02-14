
import * as express from 'express';
import { UUIDString } from '../lib';
import { PersistanceLayer, RegionInstance, HostInstance, UserInstance } from '../database';
import { Config } from '../Config';
import { AuthenticatedRequest } from '.';

import * as jwt from 'jsonwebtoken';
import * as dateFormat from 'dateformat';
/**
 * This function generates a Halcyon-style JWT.  JHalcyon is a bit particular, but this works.
 */
export function GetConsoleToken(u: UserInstance, cert: Buffer): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      {
        Username: u.username + ' ' + u.lastname,
        Scope: 'remote-console',
        Exp: dateFormat(new Date().setDate(new Date().getDate() + 2), 'mm/dd/yyyy h:MM:ss'),
        UserId: u.UUID,
        BirthDate: new Date(u.created),
        PartnerId: u.partner
      },
      cert,
      {
        algorithm: 'RS256',
        noTimestamp: true
      },
      (err: Error, token: string) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  })
}

export function ConsoleHandler(db: PersistanceLayer, config: Config, isUser: any): express.Router {
  let router = express.Router();

  router.post('/open/:uuid', isUser, (req: AuthenticatedRequest, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let region: RegionInstance;
    if (req.user.isAdmin) {
      res.send(JSON.stringify({ Success: false, Message: 'Console is restricted to admin' }));
      return;
    }
    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (!r.isRunning) {
        throw new Error('Region must be running to open a console');
      }
      region = r;
      return db.Users.getByID(req.user.uuid);
    }).then((u: UserInstance) => {
      return GetConsoleToken(u, config.mgm.certificate);
    }).then((t: string) => {
      res.send(JSON.stringify({
        Success: true,
        Token: t,
        URL: 'http://' + region.externalAddress + ':' + region.httpPort
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
