import { IUser } from '../types';

import * as jwt from 'jsonwebtoken';
import * as dateFormat from 'dateformat';
import Promise = require('bluebird');

export class HalcyonJWT {
  private static _instance: HalcyonJWT = null;
  private cert: Buffer

  constructor(cert: Buffer) {
    if (HalcyonJWT._instance) {
      throw new Error('HalcyonJWT singleton has already been initialized');
    }

    this.cert = cert;

    HalcyonJWT._instance = this;
  }

  public static instance(): HalcyonJWT {
    return HalcyonJWT._instance;
  }

  public GetConsoleToken(u: IUser): Promise<string> {
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
        this.cert,
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

  public GetAdminToken(u: IUser): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        {
          Username: u.username + ' ' + u.lastname,
          Scope: 'remote-admin',
          Exp: dateFormat(new Date().setDate(new Date().getDate() + 2), 'mm/dd/yyyy h:MM:ss'),
          UserId: u.UUID,
          BirthDate: new Date(u.created),
          PartnerId: u.partner
        },
        this.cert,
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
}