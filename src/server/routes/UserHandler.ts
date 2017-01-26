
import * as express from 'express';

import { PersistanceLayer, UserInstance, PendingUserInstance } from '../database';
import { Credential } from '../auth/Credential';
import { EmailMgr } from '../util/Email';
import { UUIDString } from '../util/UUID';
import { IUser, IPendingUser } from '../../common/messages';

export function UserHandler(db: PersistanceLayer, templates: { [key: string]: string }, isUser, isAdmin): express.Router {
  let router = express.Router();

  router.get('/', isUser, (req, res) => {
    let outUsers: any[] = [];
    let outPUsers: any[] = [];
    db.Users.getAll().then((users: UserInstance[]) => {
      //map these to simian appearing users for current MGM front-end
      outUsers = users.map( (u: UserInstance) => {
        let iu: IUser = {
          uuid: u.UUID,
          name: u.username + ' ' + u.lastname,
          email: u.email,
          godLevel: u.godLevel
        }
        return iu;
      });
    }).then(() => {
      // only admins see pending users
      if (req.cookies['userLevel'] >= 250) {
        return db.PendingUsers.getAll();
      } else {
        return [];
      }
    }).then((users: PendingUserInstance[]) => {
      outPUsers = users.map( (u: PendingUserInstance) => {
        let iu: IPendingUser = {
          name: u.name,
          email: u.email,
          gender: u.gender,
          registered: u.registered,
          summary: u.summary
        }
        return iu;
      })
    }).then(() => {
      res.send(JSON.stringify({
        Success: true,
        Users: outUsers,
        Pending: outPUsers
      }));
    })
  });


  router.post('/accessLevel', isAdmin, (req, res) => {
    let accessLevel = parseInt(req.body.accessLevel);
    let userID = new UUIDString(req.body.uuid);
    let controllingUser = new UUIDString(req.cookies['uuid']);

    if(userID.getShort() === controllingUser.getShort()){
      return res.send(JSON.stringify({ Success: false, Message: 'You cannot change your own access level' }));
    }

    if (accessLevel < 0 || accessLevel > 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid access level' }));
    }

    db.Users.getByID(userID.toString()).then((u: UserInstance) => {
      console.log('setting access level for user ' + userID + ' to ' + accessLevel);
      u.godLevel = accessLevel;
      return u.save();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/email', isAdmin, (req, res) => {
    let email = req.body.email;
    let userID = new UUIDString(req.body.id);

    if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid Email' }));
    }

    db.Users.getByID(userID.toString()).then((u: UserInstance) => {
      u.email = email;
      return u.save();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/password', isAdmin, (req, res) => {
    let password = req.body.password;
    let userID = new UUIDString(req.body.id);

    if (!password || password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Password cannot be blank' }));
    }

    db.Users.getByID(userID.toString()).then((u: UserInstance) => {
      u.passwordHash = Credential.fromPlaintext(password).hash;
      return u.save();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/suspend', isAdmin, (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/destroy/:id', isAdmin, (req, res) => {
    let userID = new UUIDString(req.params.id);
    
    // TODO: dont delete user if they own an estate or group, unless empty, then cascade
    // delete users inventory, appearance, memberships, etc.

    db.Users.getByID(userID.toString()).then((u: UserInstance) => {
      return u.destroy();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/create', isAdmin, (req, res) => {
    let fullname: string = req.body.name.trim() || '';
    let email = req.body.email || '';
    let template: string = req.body.template || '';
    let password = req.body.password || '';


    if (!fullname.trim().match('^[A-z]+ [A-z]+') || template === '' || password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Incomplete form submission' }));
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

    let templateUser: UserInstance;
    db.Users.getByID(templateID.toString()).then((t: UserInstance) => {
      templateUser = t;
      //create the user account
      return db.Users.createUserFromTemplate(names[0], names[1], Credential.fromPlaintext(password), email, templateUser);
    }).then((u: UserInstance) => {
      res.send(JSON.stringify({ Success: true, Message: u.UUID }));
    }).catch((err: Error) => {
      console.log(err);
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  //deny a pending user
  router.post('/deny', isAdmin, (req, res) => {
    let name = req.body.name;
    let reason = req.body.reason;
    let user: PendingUserInstance
    db.PendingUsers.getByName(name).then((u: PendingUserInstance) => {
      user = u;
      return EmailMgr.instance().accountDenied(u.email, reason);
    }).then(() => {
      return user.destroy();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });;
  });

  //approve a pending user, creating their halcyon account
  router.post('/approve', isAdmin, (req, res) => {
    let name = req.body.name;
    let pUser: PendingUserInstance
    let newUser: UserInstance
    db.PendingUsers.getByName(name).then((u: PendingUserInstance) => {
      pUser = u;
      if (!(u.gender in templates)) {
        throw new Error('Invalid template selector');
      }
      let templateID: UUIDString;
      try {
        templateID = new UUIDString(templates[u.gender]);
      } catch (e) {
        return res.send(JSON.stringify({ Success: false, Message: 'Selected template does not contain a user uuid' }));
      }
      return templateID;
    }).then( (templateID: UUIDString) => {
      return db.Users.getByID(templateID.toString());
    }).then((t: UserInstance) => {
      let names = pUser.name.trim().split(' ');
      return db.Users.createUserFromTemplate(names[0], names[1], Credential.fromHalcyon(pUser.password), pUser.email, t);
    }).then((nu: UserInstance ) => {
      newUser = nu;
      return pUser.destroy();
    }).then(() => {
      return EmailMgr.instance().accountApproved(pUser.name, pUser.email);
    }).then(() => {
      res.send(JSON.stringify({ Success: true, Message: newUser.UUID }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });

  });

  return router;
}
