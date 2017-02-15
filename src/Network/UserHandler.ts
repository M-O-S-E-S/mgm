import { Response, RequestHandler } from 'express';
import { User, PendingUser, Store } from '../Store';
import { NetworkResponse, AuthenticatedRequest } from './messages';


export function GetUsersHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    let outUsers: any[] = [];
    let outPUsers: any[] = [];
    store.Users.getAll()
      .then((users: User[]) => {
        outUsers = users;
        // only admins see pending users
        if (req.user.isAdmin) {
          return store.PendingUsers.getAll();
        } else {
          return [];
        }
      }).then((pending: PendingUser[]) => {
        res.json({
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