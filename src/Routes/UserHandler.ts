import { RequestHandler } from 'express';
import { IUser, IPendingUser } from '../Types';
import { Store } from '../Store';
import { AuthenticatedRequest } from '../Auth';

import { Response, GetUsersResponse } from '../View/ClientStack';
import { Credential } from '../Auth';

export function GetUsersHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res: Response) {
    let outUsers: IUser[] = [];
    let outPUsers: IPendingUser[] = [];
    store.Users.getAll()
      .then((users: IUser[]) => {
        outUsers = users;
        // only admins see pending users
        if (req.user.isAdmin) {
          return store.PendingUsers.getAll();
        } else {
          return [];
        }
      }).then((pending: IPendingUser[]) => {
        res.json(<GetUsersResponse>{
          Success: true,
          Users: outUsers,
          Pending: pending
        });
      }).catch((err: Error) => {
        res.json({
          Success: false,
          Message: err.message
        });
      });
  }
}

export function SetPasswordHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res: Response) => {
    let password = req.body.password;
    let userID = req.body.id;

    // A user must be an admin, or setting thier own password to succeed
    if (!req.user.isAdmin && req.user.uuid !== userID) {
      return res.json({ Success: false, Message: 'Access Denied' });
    }

    if (!password || password === '') {
      return res.json({ Success: false, Message: 'Password cannot be blank' });
    }

    store.Users.getByID(userID).then((u: IUser) => {
      return store.Users.setPassword(u, Credential.fromPlaintext(password));
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

/*
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
  */