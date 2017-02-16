import { RequestHandler } from 'express';
import { IUser, IPendingUser, Store } from '../Store';
import { AuthenticatedRequest } from './Authorizer';

import { Response, GetUsersResponse} from './ClientStack';

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