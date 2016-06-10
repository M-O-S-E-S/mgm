
import * as express from 'express';

import { User, Credential } from '../../halcyon/User';
import { UUIDString } from '../../halcyon/UUID';
import { SqlConnector } from '../../halcyon/sqlConnector';

export function UserHandler(hal: SqlConnector, templates: {[key: string]: string}): express.Router {
  let router = express.Router();

  router.get('/', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    hal.getAllUsers().then((users: User[]) => {
      //map these to simina appearing users for current MGM front-end
      let result: any[] = [];
      for (let u of users) {
        result.push({
          name: u.username + ' ' + u.lastname,
          uuid: u.UUID.toString(),
          email: u.email,
          userLevel: u.godLevel,
          identities: [{
            Identifier: u.username + ' ' + u.lastname,
            Enabled: true
          }],
          group: ''
        });
      }
      res.send(JSON.stringify({
        Success: true,
        Users: result,
        Pending: []
      }));
    });
  });


  router.post('/accessLevel', (req, res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let accessLevel = parseInt(req.body.accessLevel);
    let userID = new UUIDString(req.body.uuid);

    if (accessLevel < 0 || accessLevel > 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid access level' }));
    }

    hal.getUser(userID).then((u: User) => {
      console.log('setting access level for user ' + userID + ' to ' + accessLevel);
      return hal.setGodLevel(u, accessLevel);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/email', (req, res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let email = req.body.email;
    let userID = new UUIDString(req.body.id);

    if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid Email' }));
    }

    hal.getUser(userID).then((u: User) => {
      hal.setEmail(u, email);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/password', (req, res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let password = req.body.password;
    let userID = new UUIDString(req.body.id);

    if (!password || password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Password cannot be blank' }));
    }

    hal.getUser(userID).then((u: User) => {
      return hal.setUserPassword(u.UUID.toString(), Credential.fromPlaintext(password));
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/suspend', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/destroy/:id', (req, res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let userID = new UUIDString(req.params.id);

    hal.getUser(userID).then( (u: User) => {
      return hal.deleteUser(u.UUID);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/create', (req, res) => {

    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let fullname: string = req.body.name.trim() || '';
    let email = req.body.email || '';
    let template: string = req.body.template || '';
    let password = req.body.password || '';


    if( ! fullname.trim().match('^[A-z]+ [A-z]+') || email === '' || template === '' || password === ''){
      return res.send(JSON.stringify({ Success: false, Message: 'Missing form parts' }));
    }

    let names: string[] = fullname.split(' ');

    if(! (template in templates)){
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid template selector' }));
    }

    let templateID: UUIDString;
    try {
      templateID = new UUIDString(templates[template]);
    } catch (e) {
      console.log(e);
      return res.send(JSON.stringify({ Success: false, Message: 'Selected template does not contain a user uuid' }));
    }

    hal.getUser(new UUIDString(templates[template])).then( (t: User) => {
      return t.templateOnto(names[0], names[1], password, email, hal);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
