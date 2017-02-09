
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
  router.post('/', multer().array(''), (req, res) => {
    let token = req.body.token || '';
    new Promise((resolve, reject) => {
      jwt.verify(token, tokenKey, (err: Error, decoded: UserDetail) => {
        if (err) reject(err);
        resolve(decoded);
      });
    }).then( (ud: UserDetail) => {
      
    })
      jwt.verify(token, tokenKey, (err: Error, decoded: UserDetail) => {
        if (err) {
          res.send(JSON.stringify({
            Success: false
          }));
        } else {
          let resp: LoginResponse = {
            Success: true,
            uuid: decoded.uuid,
            username: decoded.name,
            accessLevel: decoded.godLevel.toString(),
            email: decoded.email,
            token: token
          }
          res.send(JSON.stringify(resp));
        }
      });
      /*if (req.cookies['uuid'] && req.cookies['uuid'] != '') {
        console.log('User ' + req.cookies['uuid'] + ' resuming session');
  
        res.send(JSON.stringify({
          Success: true,
          username: req.cookies['name'],
          accessLevel: req.cookies['userLevel'],
          email: req.cookies['email']
        }));
      } else {
        res.send(JSON.stringify({
          Success: false
        }));
      }*/
      res.send(JSON.stringify({
        Success: false
      }));
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
