import { RequestHandler } from 'express';
import { IGroup, IRole, IMember } from '../Types';
import { Store } from '../Store'
import { AuthenticatedRequest } from '../Auth';

import { Response, GetGroupsResponse } from '../View/ClientStack';

export function GetGroupsHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
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

export function AddMemberHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let groupID = req.params.id;
    let userID = req.body.user;
    let roleID = req.body.role;

    // confirm user exists
    store.Users.getByID(userID).then(() => {
      // user exists
      // confirm group exists
      return store.Groups.getAll();
    }).then((groups: IGroup[]) => {
      let found = false;
      groups.map((g: IGroup) => {
        if (g.GroupID === groupID)
          found = true;
      });
      if (!found)
        throw new Error('Group ' + groupID + ' does not exist');
    }).then(() => {
      return store.Groups.getMembers();
    }).then((members: IMember[]) => {
      // reject if user is already a member
      members.map((m: IMember) => {
        if (m.AgentID === userID && m.GroupID === groupID)
          throw new Error('User ' + userID + ' is already a member of group ' + groupID);
      });
    }).then(() => {
      return store.Groups.addMember(<IMember>{
        GroupID: groupID,
        AgentID: userID,
        SelectedRoleID: roleID
      });
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  }
}

export function RemoveMemberHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let groupID = req.params.id;
    let userID = req.body.user;

    store.Groups.removeMember(<IMember>{
      AgentID: userID,
      GroupID: groupID
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  }
}