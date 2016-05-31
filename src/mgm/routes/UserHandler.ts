
import * as express from 'express';

import { User } from '../../halcyon/User';

export interface Halcyon {
  getAllUsers(): Promise<User[]>
}

export function UserHandler(hal: Halcyon): express.Router {
  let router = express.Router();

  router.get('/', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    hal.getAllUsers().then((users: User[]) => {
      //map these to simina appearing users for current MGM front-end
      let result: any[] = [];
      let counter = 0;
      for (let u of users) {
        result.push({
          name: u.username + ' ' + u.lastname,
          uuid: u.UUID.toString(),
          email: u.email + counter,
          userLevel: u.godLevel,
          identities: [{
            Identifier: u.username + ' ' + u.lastname,
            Enabled: true
          }],
          group: ''
        });
        counter++;
      }
      res.send(JSON.stringify({
        Success: true,
        Users: result,
        Pending: []
      }));
    });
  });


  router.post('/accessLevel', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/email', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/password', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/suspend', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/destroy/:id', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/create', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  return router;
}
