
import * as express from 'express';
import { Credential, UUIDString } from '../lib';
import { PersistanceLayer, UserInstance } from '../database';
import { LoginResponse } from '../common/messages';

import * as jwt from 'jsonwebtoken';
import * as multer from 'multer';

import { UserDetail } from '.';

export function AuthHandler(db: PersistanceLayer, tokenKey: string, isUser: any): express.Router {
  let router: express.Router = express.Router();

  //resume session and refresh token
  router.get('/', isUser, (req, res) => {
    let userDetail: UserDetail;

    let ud: UserDetail = req.user;
    // trim off extra jwt baggage
    userDetail = {
      uuid: ud.uuid,
      name: ud.name,
      godLevel: ud.godLevel,
      email: ud.email
    };
    jwt.sign(
      userDetail,
      tokenKey,
      {
        expiresIn: '1d'
      },
      (err: Error, newToken: string) => {
        if (err) {
          console.log('Resume session failed: ' + err.message);
          return res.send(JSON.stringify({
            Success: false,
            Message: err.message
          }));
        }

        let resp: LoginResponse = {
          Success: true,
          uuid: userDetail.uuid,
          username: userDetail.name,
          accessLevel: userDetail.godLevel.toString(),
          email: userDetail.email,
          token: newToken
        }
        res.send(JSON.stringify(resp));
      }
    );
  });

  router.get('/logout', isUser, (req, res) => {
    res.send(JSON.stringify({
      Success: true
    }));
  });

  router.post('/login', multer().array(''), (req, res) => {
    let auth = req.body;
    let username: string = auth.username || '';
    let password: string = auth.password || '';
    let candidateUser: UserInstance;
    db.Users.getByName(username).then((u: UserInstance) => {
      if (Credential.fromHalcyon(u.passwordHash).compare(password)) {

        if (u.godLevel === 0) {
          throw new Error('Account Suspended');
        } else {
          candidateUser = u;
        }
      } else {
        throw new Error('Invalid Credentials');
      }
    }).then(() => {
      let detail: UserDetail = {
        name: candidateUser.username + ' ' + candidateUser.lastname,
        uuid: candidateUser.UUID,
        godLevel: candidateUser.godLevel,
        email: candidateUser.email
      }
      return jwt.sign(
        detail,
        tokenKey,
        {
          expiresIn: '1d'
        }
      );
    }).then((token: string) => {
      let resp: LoginResponse = {
        Success: true,
        uuid: candidateUser.UUID,
        username: candidateUser.username + ' ' + candidateUser.lastname,
        accessLevel: candidateUser.godLevel.toString(),
        email: candidateUser.email,
        token: token
      }
      res.send(JSON.stringify(resp));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/changePassword', isUser, (req, res) => {
    let password: string = req.body.password || '';

    if (password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Password cannot be blank' }));
    }

    let credential = Credential.fromPlaintext(password);

    db.Users.getByID(req.cookies['uuid']).then((u: UserInstance) => {
      u.passwordHash = credential.hash;
      return u.save();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      console.log('Error updating user password: ' + err.message);
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
