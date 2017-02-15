import { Response, RequestHandler } from 'express';
import { Group, Role, Member, Store } from '../Store';
import { NetworkResponse, AuthenticatedRequest } from './messages';


export function GetGroupsHander(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    let outGroups: Group[] = [];
    let outRoles: Role[] = [];
    let outMembers: Member[] = [];

    store.Groups.getAll().then((groups: Group[]) => {
      outGroups = groups;
      return store.Groups.getRoles();
    }).then((roles: Role[]) => {
      outRoles = roles;
      return store.Groups.getMembers();
    }).then((members: Member[]) => {
      outMembers = members
      res.json({
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