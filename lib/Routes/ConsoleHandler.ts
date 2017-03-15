import { RequestHandler } from 'express';
import { IUser, IRegion } from '../Types';
import { Store } from '../Store';
import { AuthenticatedRequest } from '../Auth';

import * as jwt from 'jsonwebtoken';
import * as dateFormat from 'dateformat';
/**
 * This function generates a Halcyon-style JWT.  JHalcyon is a bit particular, but this works.
 */
export function GetConsoleToken(u: IUser, cert: Buffer): Promise<string> {
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

export function ConsoleHandler(db: Store, cert: Buffer, isUser: any): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;
    let region: IRegion;
    if (req.user.isAdmin) {
      res.json({ Success: false, Message: 'Console is restricted to admin' });
      return;
    }
    db.Regions.getByUUID(regionID).then((r: IRegion) => {
      if (!r.isRunning) {
        throw new Error('Region must be running to open a console');
      }
      region = r;
      return db.Users.getByID(req.user.uuid);
    }).then((u: IUser) => {
      return GetConsoleToken(u, cert);
    }).then((t: string) => {
      res.json({
        Success: true,
        Token: t,
        URL: 'http://' + region.publicAddress + ':' + region.port
      });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}
