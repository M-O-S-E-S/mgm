
import * as express from 'express';

import { MGM } from '../MGM';
import { User, UserMgr, Credential } from '../../halcyon/User';
import { EmailMgr } from '../util/Email';
import { PendingUser, PendingUserMgr } from '../PendingUser';
import { UUIDString } from '../../halcyon/UUID';

export function UserHandler(templates: { [key: string]: string }): express.Router {
  let router = express.Router();

  router.get('/', MGM.isUser, (req, res) => {
    let outUsers: any[] = [];
    let outPUsers: any[] = [];
    UserMgr.instance().getUsers().then((users: User[]) => {
      //map these to simian appearing users for current MGM front-end
      for (let u of users) {
        outUsers.push({
          name: u.getUsername() + ' ' + u.getLastName(),
          uuid: u.getUUID().toString(),
          email: u.getEmail(),
          userLevel: u.getGodLevel(),
          identities: [{
            Identifier: u.getUsername() + ' ' + u.getLastName(),
            Enabled: true
          }],
          group: ''
        });
      }
    }).then(() => {
      // only admins see pending users
      if (req.cookies['userLevel'] >= 250) {
        return PendingUserMgr.instance().getAll();
      } else {
        return [];
      }
    }).then((users: PendingUser[]) => {
      for (let u of users) {
        outPUsers.push({
          name: u.getName(),
          email: u.getEmail(),
          gender: u.getGender(),
          registered: u.getRegistered(),
          summary: u.getSummary()
        });
      }
    }).then(() => {
      res.send(JSON.stringify({
        Success: true,
        Users: outUsers,
        Pending: outPUsers
      }));
    })
  });


  router.post('/accessLevel', MGM.isAdmin, (req, res) => {
    let accessLevel = parseInt(req.body.accessLevel);
    let userID = new UUIDString(req.body.uuid);

    if (accessLevel < 0 || accessLevel > 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid access level' }));
    }

    UserMgr.instance().getUser(userID).then((u: User) => {
      console.log('setting access level for user ' + userID + ' to ' + accessLevel);
      return u.setGodLevel(accessLevel);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/email', MGM.isAdmin, (req, res) => {
    let email = req.body.email;
    let userID = new UUIDString(req.body.id);

    if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid Email' }));
    }

    UserMgr.instance().getUser(userID).then((u: User) => {
      return u.setEmail(email);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/password', MGM.isAdmin, (req, res) => {
    let password = req.body.password;
    let userID = new UUIDString(req.body.id);

    if (!password || password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Password cannot be blank' }));
    }

    UserMgr.instance().getUser(userID).then((u: User) => {
      return u.setCredential(Credential.fromPlaintext(password));
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/suspend', MGM.isAdmin, (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/destroy/:id', MGM.isAdmin, (req, res) => {
    let userID = new UUIDString(req.params.id);

    UserMgr.instance().getUser(userID).then((u: User) => {
      return UserMgr.instance().deleteUser(u);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/create', MGM.isAdmin, (req, res) => {
    let fullname: string = req.body.name.trim() || '';
    let email = req.body.email || '';
    let template: string = req.body.template || '';
    let password = req.body.password || '';


    if (!fullname.trim().match('^[A-z]+ [A-z]+') || email === '' || template === '' || password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Missing form parts' }));
    }

    let names: string[] = fullname.split(' ');

    if (!(template in templates)) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid template selector' }));
    }

    let templateID: UUIDString;
    try {
      templateID = new UUIDString(templates[template]);
    } catch (e) {
      return res.send(JSON.stringify({ Success: false, Message: 'Selected template does not contain a user uuid' }));
    }

    UserMgr.instance().getUser(templateID).then((t: User) => {
      return UserMgr.instance().createFromTemplate(t, names[0], names[1], Credential.fromPlaintext(password), email);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  //deny a pending user
  router.post('/deny', MGM.isAdmin, (req, res) => {
    let name = req.body.name;
    let reason = req.body.reason;
    let user: PendingUser
    PendingUserMgr.instance().getByName(name).then((u: PendingUser) => {
      user = u;
      return EmailMgr.instance().accountDenied(u.getEmail(), reason);
    }).then(() => {
      return PendingUserMgr.instance().delete(user.getName());
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });;
  });

  //approve a pending user, creating their halcyon account
  router.post('/approve', MGM.isAdmin, (req, res) => {
    let name = req.body.name;
    let pUser: PendingUser
    PendingUserMgr.instance().getByName(name).then((u: PendingUser) => {
      pUser = u;
      if (!(u.getGender() in templates)) {
        throw new Error('Invalid template selector');
      }
      let templateID: UUIDString;
      try {
        templateID = new UUIDString(templates[u.getGender()]);
      } catch (e) {
        return res.send(JSON.stringify({ Success: false, Message: 'Selected template does not contain a user uuid' }));
      }
      return templateID;
    }).then( (templateID: UUIDString) => {
      return UserMgr.instance().getUser(templateID);
    }).then((t: User) => {
      let names = pUser.getName().split(' ');
      return UserMgr.instance().createFromTemplate(t, names[0], names[1], pUser.getPassword(), pUser.getEmail());
    }).then(() => {
      return PendingUserMgr.instance().delete(pUser.getName());
    }).then(() => {
      return EmailMgr.instance().accountApproved(pUser.getName(), pUser.getEmail());
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });

  });

  return router;
}
