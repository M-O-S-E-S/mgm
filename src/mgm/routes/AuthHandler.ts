
import * as express from 'express';
import { User, UserMgr, Credential } from '../../halcyon/User';
import { MGM } from '../MGM';
import { UUIDString } from '../../halcyon/UUID';

export interface Halcyon {
  getUserByName(string): Promise<User>
  setUserPassword(string, Credential): Promise<void>
}

export function AuthHandler(): express.Router {
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

  router.get('/logout', MGM.isUser, (req, res) => {
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
    UserMgr.instance().getUserByName(username).then((u: User) => {
      if (u.getCredential().compare(password)) {

        if (u.getGodLevel() === 0) {
          res.send(JSON.stringify({
            Success: false,
            Message: 'Account Suspended'
          }));
        } else {
          res.cookie('name', u.getUsername());
          res.cookie('uuid', u.getUUID().toString());
          res.cookie('userLevel', u.getGodLevel());
          res.cookie('email', u.getEmail());

          res.send(JSON.stringify({
            Success: true,
            username: u.getUsername(),
            accessLevel: u.getGodLevel(),
            email: u.getEmail()
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

  router.post('/changePassword', MGM.isUser, (req, res) => {
    let password: string = req.body.password || '';

    if (password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Password cannot be blank' }));
    }

    let credential = Credential.fromPlaintext(password);

    console.log(credential.hash);

    UserMgr.instance().getUser(new UUIDString(req.cookies['uuid'])).then( (u: User) => {
      return u.setCredential(credential);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
