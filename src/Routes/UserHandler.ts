import { RequestHandler } from 'express';
import { IUser, IPendingUser } from '../Types';
import { Store } from '../Store';
import { AuthenticatedRequest } from './Authorizer';

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
