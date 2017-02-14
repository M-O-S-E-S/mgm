
import * as express from 'express';

import { PersistanceLayer, UserInstance, PendingUserInstance } from '../database';
import { Credential, EmailMgr, UUIDString } from '../lib';
import { IPendingUser } from '../common/messages';
import { AuthenticatedRequest } from '.';

export function UserHandler(db: PersistanceLayer, templates: { [key: string]: string }, isUser, isAdmin): express.Router {
  let router = express.Router();

  router.get('/', isUser, (req: AuthenticatedRequest, res) => {
    let outUsers: any[] = [];
    let outPUsers: any[] = [];
    return db.Users.getAll()
      .then((users: UserInstance[]) => {
        outUsers = users;
        // only admins see pending users
        if (req.user.isAdmin) {
          return db.PendingUsers.getAll();
        } else {
          return [];
        }
      }).then((users: PendingUserInstance[]) => {
        outPUsers = users.map((u: PendingUserInstance) => {
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
        res.json({
          Success: true,
          Users: outUsers,
          Pending: outPUsers
        });
      })
  });


  router.post('/accessLevel', isAdmin, (req: AuthenticatedRequest, res) => {
    let accessLevel = parseInt(req.body.accessLevel);
    let userID = new UUIDString(req.body.uuid);
    let controllingUser = new UUIDString(req.user.uuid);

    if (userID.getShort() === controllingUser.getShort()) {
      return res.json({ Success: false, Message: 'You cannot change your own access level' });
    }

    if (accessLevel < 0 || accessLevel > 250) {
      return res.json({ Success: false, Message: 'Invalid access level' });
    }

    db.Users.getByID(userID.toString()).then((u: UserInstance) => {
      console.log('setting access level for user ' + userID + ' to ' + accessLevel);
      u.godLevel = accessLevel;
      return u.save();
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  router.post('/email', isAdmin, (req: AuthenticatedRequest, res) => {
    let email = req.body.email;
    let userID = new UUIDString(req.body.id);

    if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
      return res.json({ Success: false, Message: 'Invalid Email' });
    }

    db.Users.getByID(userID.toString()).then((u: UserInstance) => {
      u.email = email;
      return u.save();
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  router.post('/password', isAdmin, (req: AuthenticatedRequest, res) => {
    let password = req.body.password;
    let userID = new UUIDString(req.body.id);

    if (!password || password === '') {
      return res.json({ Success: false, Message: 'Password cannot be blank' });
    }

    db.Users.getByID(userID.toString()).then((u: UserInstance) => {
      u.passwordHash = Credential.fromPlaintext(password).hash;
      return u.save();
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  router.post('/suspend', isAdmin, (req: AuthenticatedRequest, res) => {
    res.json({ Success: false, Message: 'Not Implemented' });
  });

  router.post('/destroy/:id', isAdmin, (req: AuthenticatedRequest, res) => {
    let userID = new UUIDString(req.params.id);

    // TODO: dont delete user if they own an estate or group, unless empty, then cascade
    // delete users inventory, appearance, memberships, etc.

    db.Users.getByID(userID.toString()).then((u: UserInstance) => {
      return u.destroy();
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  router.post('/create', isAdmin, (req: AuthenticatedRequest, res) => {
    let fullname: string = req.body.name.trim() || '';
    let email = req.body.email || '';
    let template: string = req.body.template || '';
    let password = req.body.password || '';


    if (!fullname.trim().match('^[A-z]+ [A-z]+') || template === '' || password === '') {
      return res.json({ Success: false, Message: 'Incomplete form submission' });
    }

    let names: string[] = fullname.split(' ');

    if (!(template in templates)) {
      return res.json({ Success: false, Message: 'Invalid template selector' });
    }

    let templateID: UUIDString;
    try {
      templateID = new UUIDString(templates[template]);
    } catch (e) {
      return res.json({ Success: false, Message: 'Selected template does not contain a user uuid' });
    }

    let templateUser: UserInstance;
    db.Users.getByID(templateID.toString()).then((t: UserInstance) => {
      templateUser = t;
      //create the user account
      return db.Users.createUserFromTemplate(names[0], names[1], Credential.fromPlaintext(password), email, templateUser);
    }).then((u: UserInstance) => {
      res.json({ Success: true, Message: u.UUID });
    }).catch((err: Error) => {
      console.log(err);
      res.json({ Success: false, Message: err.message });
    });
  });

  //deny a pending user
  router.post('/deny', isAdmin, (req: AuthenticatedRequest, res) => {
    let name = req.body.name;
    let reason = req.body.reason;
    let user: PendingUserInstance
    db.PendingUsers.getByName(name).then((u: PendingUserInstance) => {
      user = u;
      return EmailMgr.instance().accountDenied(u.email, reason);
    }).then(() => {
      return user.destroy();
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });;
  });

  //approve a pending user, creating their halcyon account
  router.post('/approve', isAdmin, (req: AuthenticatedRequest, res) => {
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
        return res.json({ Success: false, Message: 'Selected template does not contain a user uuid' });
      }
      return templateID;
    }).then((templateID: UUIDString) => {
      return db.Users.getByID(templateID.toString());
    }).then((t: UserInstance) => {
      let names = pUser.name.trim().split(' ');
      return db.Users.createUserFromTemplate(names[0], names[1], Credential.fromHalcyon(pUser.password), pUser.email, t);
    }).then((nu: UserInstance) => {
      newUser = nu;
      return pUser.destroy();
    }).then(() => {
      return EmailMgr.instance().accountApproved(pUser.name, pUser.email);
    }).then(() => {
      res.json({ Success: true, Message: newUser.UUID });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });

  });

  return router;
}
