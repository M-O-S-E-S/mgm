
import * as express from 'express';

import { Group } from '../../halcyon/group';
import { User } from '../../halcyon/User';
import { UUIDString } from '../../halcyon/UUID';

export interface Halcyon {
  getGroups(): Promise<Group[]>
  getUser(UUIDString): Promise<User>
  getGroupByUUID(UUIDString): Promise<Group>
  addMemberToGroup(Group, User, UUIDString): Promise<void>
  removeMemberFromGroup(Group, User): Promise<void>
}

export function GroupHandler(hal: Halcyon): express.Router {
  let router = express.Router();

  router.get('/', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    hal.getGroups().then((groups: Group[]) => {
      let result = [];
      for (let g of groups) {
        let r = {
          ShowInList: g.ShowInList,
          InsigniaID: g.InsigniaID.toString(),
          MaturePublish: g.MaturePublish,
          FounderID: g.FounderID.toString(),
          EveryOnePowers: '?',
          OwnerRoleID: g.OwnerRoleID.toString(),
          OwnerPowers: '?',
          uuid: g.GroupID.toString(),
          name: g.Name,
          members: [],
          roles: []
        };
        for (let m of g.Members) {
          r.members.push({
            OwnerID: m.AgentID
          });
        }
        for (let m of g.Roles) {
          r.roles.push({
            Name: m.Name,
            Description: m.Description,
            Title: m.Title,
            Powers: '?',
            roleID: m.RoleID.toString()
          })
        }
        result.push(r);
      }
      res.send(JSON.stringify({ Success: true, Groups: result }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  router.post('/removeUser/:id', (req,res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let groupID = new UUIDString(req.params.id);
    let userID = new UUIDString(req.body.user);
    let user: User;

    console.log('Removing user ' + userID + ' from group');

    hal.getUser(userID).then( (u: User) => {
      user = u;
      return hal.getGroupByUUID(groupID);
    }).then( (g: Group) => {
      return hal.removeMemberFromGroup(g, user);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  router.post('/addUser/:id', (req, res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let groupID = new UUIDString(req.params.id);
    let userID = new UUIDString(req.body.user);
    let roleID = new UUIDString(req.body.role);

    let user: User;

    console.log('Placing user ' + userID + ' into group ' + groupID + ' with role ' + roleID);

    hal.getUser(userID).then( (u: User) => {
      user = u;
      return hal.getGroupByUUID(groupID);
    }).then( (g: Group) => {
      for(let u of g.Members){
        if( u.AgentID.toString() === userID.toString()){
          throw new Error('User is already a member of that group');
        }
      }
      let roleExists = false;
      for( let r of g.Roles){
        if(r.RoleID.toString() === roleID.toString()){
          roleExists = true;
        }
      }
      if(!roleExists){
        throw new Error('That role does not exist on group ' + g.Name);
      }
      return g;
    }).then( (g : Group) => {
      return hal.addMemberToGroup(g, user, roleID);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  return router;
}
