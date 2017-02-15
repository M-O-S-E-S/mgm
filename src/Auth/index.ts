
export { UserDetail } from './UserDetail';

/*
import * as express from 'express';
import { Credential, UUIDString } from '../lib';
import { PersistanceLayer, UserInstance, EstateInstance, ManagerInstance, EstateMapInstance } from '../database';
import { LoginResponse } from '../common/messages';
import { Set } from 'immutable';

import * as jwt from 'jsonwebtoken';
import * as multer from 'multer';


import { UserDetail, AuthenticatedRequest } from '.';

export function AuthHandler(db: PersistanceLayer, cert: Buffer, isUser: any): express.Router {
  let router: express.Router = express.Router();

  router.get('/logout', isUser, (req: AuthenticatedRequest, res) => {
    res.json({
      Success: true
    });
  });

  router.post('/login', multer().array(''), (req, res) => {
    let auth = req.body;
    let username: string = auth.username || '';
    let password: string = auth.password || '';
    let candidateUser: UserInstance;
    db.Users.getByName(username).then((u: UserInstance) => {
      if (Credential.fromHalcyon(u.passwordHash).compare(password)) {

        if (u.isSuspended()) {
          throw new Error('Account Suspended');
        } else {
          candidateUser = u;
        }
      } else {
        throw new Error('Invalid Credentials');
      }
    }).then(() => {
      return getUserPermissions(candidateUser.UUID);
    }).then((ud: UserDetail) => {
      return jwt.sign(
        ud,
        cert,
        {
          expiresIn: '1d'
        }
      );
    }).then((token: string) => {
      let resp: LoginResponse = {
        Success: true,
        uuid: candidateUser.UUID,
        username: candidateUser.username + ' ' + candidateUser.lastname,
        isAdmin: candidateUser.isAdmin(),
        email: candidateUser.email,
        token: token
      }
      res.json(resp);
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  router.post('/changePassword', isUser, (req: AuthenticatedRequest, res: express.Response) => {
    let password: string = req.body.password || '';

    if (password === '') {
      return res.json({ Success: false, Message: 'Password cannot be blank' });
    }

    let credential = Credential.fromPlaintext(password);

    db.Users.getByID(req.user.uuid).then((u: UserInstance) => {
      u.passwordHash = credential.hash;
      return u.save();
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      console.log('Error updating user password: ' + err.message);
      res.json({ Success: false, Message: err.message });
    });
  });

  return router;
}


*/