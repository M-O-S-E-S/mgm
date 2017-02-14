
import * as express from 'express';

import { PersistanceLayer, GroupInstance, UserInstance, RoleInstance, MembershipInstance } from '../database';
import { UUIDString } from '../lib';
import { IGroup, IRole, IMembership } from '../common/messages';
import { AuthenticatedRequest } from '.';

export function GroupHandler(db: PersistanceLayer, isUser: any, isAdmin): express.Router {
  let router = express.Router();

  router.get('/', isUser, (req: AuthenticatedRequest, res) => {
    let iGroups: IGroup[] = [];
    let iRoles: IRole[] = [];
    let iMembers: IMembership[] = [];

    db.Groups.getGroups().then((groups: GroupInstance[]) => {
      iGroups = groups.map((g: GroupInstance) => {
        let ig: IGroup = {
          GroupID: g.GroupID,
          Name: g.Name,
          FounderID: g.FounderID,
          OwnerRoleID: g.OwnerRoleID
        }
        return ig;
      })
    }).then(() => {
      return db.Groups.getRoles();
    }).then((roles: RoleInstance[]) => {
      iRoles = roles.map((r: RoleInstance) => {
        let ir: IRole = {
          GroupID: r.GroupID,
          RoleID: r.RoleID,
          Name: r.Name,
          Description: r.Description,
          Title: r.Title,
          Powers: r.Powers
        }
        return ir;
      })
    }).then(() => {
      return db.Groups.getMembers();
    }).then((members: MembershipInstance[]) => {
      iMembers = members.map((m: MembershipInstance) => {
        let im: IMembership = {
          GroupID: m.GroupID,
          AgentID: m.AgentID,
          SelectedRoleID: m.SelectedRoleID
        }
        return im;
      })
    }).then(() => {
      res.json({
        Success: true,
        Groups: iGroups,
        Members: iMembers,
        Roles: iRoles
      });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    })
  });

  router.post('/removeUser/:id', isAdmin, (req: AuthenticatedRequest, res) => {
    let groupID = new UUIDString(req.params.id);
    let userID = new UUIDString(req.body.user);

    console.log('Removing user ' + userID + ' from group ' + groupID);

    db.Groups.getMembershipForUser(groupID.toString(), userID.toString()).then((memberships: MembershipInstance[]) => {
      return Promise.all(memberships.map((m: MembershipInstance) => {
        return m.destroy();
      }))

    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    })
  });

  router.post('/addUser/:id', isAdmin, (req: AuthenticatedRequest, res) => {
    let groupID = new UUIDString(req.params.id);
    let userID = new UUIDString(req.body.user);
    let roleID = new UUIDString(req.body.role);

    let user: UserInstance;

    console.log('Placing user ' + userID + ' into group ' + groupID + ' with role ' + roleID);

    //confirm necessary components
    db.Users.getByID(userID.toString()).then(() => {
      //user exists, confirm role
      return db.Groups.getRoleByID(groupID.toString(), roleID.toString())
    }).then(() => {
      // role exists
      return db.Groups.addUserToGroup(groupID.toString(), userID.toString(), roleID.toString());
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    })
  });

  return router;
}
