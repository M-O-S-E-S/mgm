import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import { Store } from '../Store';
import { UserDetail } from '../Auth';
import { Set } from 'immutable';

export interface AuthenticatedRequest extends Request {
  user: UserDetail
  body?: any
  params: any
}

export class Authorizer {
  private store: Store
  private cert: Buffer

  constructor(store: Store, cert: Buffer) {
    this.store = store;
    this.cert = cert;
  }

  isUser(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
    return this._isUser.bind(this);
  }

  private _isUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

  isAdmin(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
    return this._isAdmin.bind(this);
  }

  private _isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

  isNode(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
    return this._isNode.bind(this);
  }

  private _isNode(req: Request, res: Response, next: NextFunction) {
    let remoteIP: string = req.ip.split(':').pop();
    this.store.Hosts.getByAddress(remoteIP).then(() => {
      return next();
    }).catch(() => {
      return res.json({ Success: false, Message: 'Permission Denied' });
    });
  }
}