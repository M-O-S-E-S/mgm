
import * as express from 'express';
import { Credential } from '../auth/Credential';
import { UUIDString } from '../util/UUID';
import { PersistanceLayer, UserInstance } from '../database';

export function AuthHandler(db: PersistanceLayer, isUser: any): express.Router {
  let router: express.Router = express.Router();

  //resume session
  router.get('/', (req, res) => {
    if (req.cookies['uuid'] && req.cookies['uuid'] != '') {
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
    }
  });

  router.get('/logout', isUser, (req, res) => {
    console.log('User ' + req.cookies['uuid'] + ' logging out');

    res.clearCookie('name');
    res.clearCookie('uuid');
    res.clearCookie('userLevel');
    res.clearCookie('email');
    res.send(JSON.stringify({
      Success: true
    }));
  });

  router.post('/login', (req, res) => {
    let auth = req.body;
    let username: string = auth.username || '';
    let password: string = auth.password || '';
    db.Users.getByName(username).then( (u: UserInstance) => {
      if (Credential.fromHalcyon(u.passwordHash).compare(password)) {

        if (u.godLevel === 0) {
          res.send(JSON.stringify({
            Success: false,
            Message: 'Account Suspended'
          }));
        } else {
          res.cookie('name', u.username + ' ' + u.lastname);
          res.cookie('uuid', u.UUID);
          res.cookie('userLevel', u.godLevel);
          res.cookie('email', u.email);

          res.send(JSON.stringify({
            Success: true,
            username: u.username,
            accessLevel: u.godLevel,
            email: u.email
          }));
        }

      } else {
        //reject
        res.send(JSON.stringify({
          Success: false,
          Message: 'Invalid Credentials'
        }));
      }
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

    db.Users.getByID(req.cookies['uuid']).then( (u: UserInstance) => {
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
