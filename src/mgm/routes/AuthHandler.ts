
import * as express from 'express';
import { User, Credential } from '../../halcyon/User';

export interface Halcyon {
  getUserByName(string): Promise<User>
  setUserPassword(string, Credential): Promise<void>
}

export function AuthHandler(hal: Halcyon): express.Router{
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

  router.get('/logout', (req, res) => {
    if (req.cookies['uuid']) {
      console.log('User ' + req.cookies['uuid'] + ' logging out');

      res.clearCookie('name');
      res.clearCookie('uuid');
      res.clearCookie('userLevel');
      res.clearCookie('email');
      res.send(JSON.stringify({
        Success: true
      }));
    }
  });

  router.post('/login', (req, res) => {
    let auth = req.body;
    let username: string = auth.username || '';
    let password: string = auth.password || '';
    hal.getUserByName(username).then((u: User) => {
      if (u.passwordHash.compare(password)) {

        res.cookie('name', u.username);
        res.cookie('uuid', u.UUID.toString());
        res.cookie('userLevel', u.godLevel);
        res.cookie('email', u.email);

        res.send(JSON.stringify({
          Success: true,
          username: u.username,
          accessLevel: u.godLevel,
          email: u.email
        }));

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

  router.post('/changePassword', (req, res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    let password: string = req.body.password || '';

    if(password === ''){
      return res.send(JSON.stringify({ Success: false, Message: 'Password cannot be blank' }));
    }

    let credential = Credential.fromPlaintext(password);

    console.log(credential.hash);

    hal.setUserPassword(req.cookies['uuid'], credential).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
