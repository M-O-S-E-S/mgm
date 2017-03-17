import { Response, RequestHandler } from 'express';
import { sign } from 'jsonwebtoken';
import Promise = require('bluebird');

import { IUser } from '../types';
import { Store } from '../Store';
import { AuthenticatedRequest, TokenBody } from '../Auth';
import { UserDetail, Session } from '../Auth';


function signToken(uuid: string, cert: Buffer): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let payload: TokenBody = {
      uuid: uuid
    }
    sign(
      payload,
      cert,
      {
        expiresIn: '1h'
      },
      (err: Error, newToken: string) => {
        if (err)
          return reject(err);
        resolve(newToken);
      }
    );
  });
}

export function RenewTokenHandler(store: Store, session: Session, cert: Buffer): RequestHandler {
  return (req: AuthenticatedRequest, res: Response) => {
    let userDetail: UserDetail;
    store.Users.getByID(req.user.uuid).then((user: IUser) => {
      return session.updateSession(user);
    }).then((ud: UserDetail) => {
      userDetail = ud;
      return signToken(ud.uuid, cert);
    }).then((token: string) => {
      res.json({
        Success: true,
        uuid: userDetail.uuid,
        username: userDetail.name,
        isAdmin: userDetail.isAdmin,
        email: userDetail.email,
        token: token
      });
    }).catch((err: Error) => {
      res.json({
        Success: false,
        Message: err.message
      });
    });
  }
}

export function LoginHandler(store: Store, session: Session, cert: Buffer): RequestHandler {
  return function (req: AuthenticatedRequest, res: Response) {
    let username: string = req.body.username || '';
    let password: string = req.body.password || '';
    let userDetail: UserDetail;
    store.Users.getByName(username).then((u: IUser) => {
      if (u.authenticate(password)) {
        if (u.isSuspended()) {
          throw new Error('Account Suspended');
        } else {
          return u;
        }
      } else {
        //reject
        throw new Error('Invalid Credentials');
      }
    }).then((u: IUser) => {
      return session.startSession(u);
    }).then((ud: UserDetail) => {
      userDetail = ud;
      return signToken(ud.uuid, cert);
    }).then((token: string) => {
      res.json({
        Success: true,
        uuid: userDetail.uuid,
        username: userDetail.name,
        isAdmin: userDetail.isAdmin,
        email: userDetail.email,
        token: token
      });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}