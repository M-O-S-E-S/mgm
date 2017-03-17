import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


import { IUser } from '../types';
import { Store } from '../Store';
import { UserDetail, Session } from '../Auth';
import { Set } from 'immutable';

export interface AuthenticatedRequest extends Request {
  user: UserDetail
  body: any
  params: any
}

export interface TokenBody {
  uuid: string
}

export class Authorizer {
  private store: Store
  private cert: Buffer
  private session: Session

  constructor(store: Store, session: Session, cert: Buffer) {
    this.store = store;
    this.cert = cert;
    this.session = session;
  }

  isUser(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
    return this._isUser.bind(this);
  }

  private _isUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let token = req.headers['x-access-token'];
    jwt.verify(token, this.cert, (err: Error, result: TokenBody) => {
      if (err) {
        return res.json({ Success: false, Message: err.message });
      }
      this.store.Users.getByID(result.uuid).then((u: IUser) => {
        return this.session.getSession(u);
      }).then((ud: UserDetail) => {
        req.user = ud;
        // convert javascript arrays into Sets
        req.user.estates = Set<number>(req.user.estates);
        req.user.regions = Set<string>(req.user.regions);
        return next();
      }).catch((err: Error) => {
        res.json({ Success: false, Message: err.message });
      });
    });
  }

  isAdmin(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
    return this._isAdmin.bind(this);
  }

  private _isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    this._isUser(req, res, () => {
      if (req.user.isAdmin) return next();
      res.json({ Success: false, Message: 'Access Denied' });
    });
  }
}