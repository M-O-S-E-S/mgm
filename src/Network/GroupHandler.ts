import { RequestHandler } from 'express';
import { IGroup, IRole, IMember, Store } from '../Store';
import { AuthenticatedRequest } from './Authorizer';

import { Response, GetGroupsResponse } from './ClientStack';

export function GetGroupsHander(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    let outGroups: IGroup[] = [];
    let outRoles: IRole[] = [];
    let outMembers: IMember[] = [];

    store.Groups.getAll().then((groups: IGroup[]) => {
      outGroups = groups;
      return store.Groups.getRoles();
    }).then((roles: IRole[]) => {
      outRoles = roles;
      return store.Groups.getMembers();
    }).then((members: IMember[]) => {
      outMembers = members
      res.json(<GetGroupsResponse>{
        Success: true,
        Groups: outGroups,
        Members: outMembers,
        Roles: outRoles
      });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    })
  }
}