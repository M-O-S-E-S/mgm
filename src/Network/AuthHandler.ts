import { Response, RequestHandler} from 'express';
import { sign } from 'jsonwebtoken';

import { Store } from '../Store';
import { NetworkResponse, AuthenticatedRequest } from './messages';
import { UserDetail } from '../Auth';
import { GetUserPermissions } from '../Store';

export interface LoginResponse extends NetworkResponse {
    uuid: string
    username: string
    isAdmin: boolean
    email: string
    token: string
}

export function RenewTokenHandler(store: Store, cert: Buffer): RequestHandler {
  return function RenewTokenHandler(req: AuthenticatedRequest, res: Response) {
    let userDetail: UserDetail;
    GetUserPermissions(store, req.user.uuid).then((userDetail: UserDetail) => {
      sign(
        userDetail,
        cert,
        {
          expiresIn: '1d'
        },
        (err: Error, newToken: string) => {
          if (err) {
            console.log('Resume session failed: ' + err.message);
            return res.json({
              Success: false,
              Message: err.message
            });
          }

          let resp: LoginResponse = {
            Success: true,
            uuid: userDetail.uuid,
            username: userDetail.name,
            isAdmin: userDetail.isAdmin,
            email: userDetail.email,
            token: newToken
          }
          res.json(resp);
        }
      );
    }).catch((err: Error) => {
      res.json({
        Success: false,
        Message: err.message
      });
    });
  }
}