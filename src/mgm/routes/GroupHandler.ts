
import * as express from 'express';

import { MGM } from '../MGM';
import { Group, GroupMgr } from '../../halcyon/Group';
import { User, UserMgr } from '../../halcyon/User';
import { UUIDString } from '../../halcyon/UUID';

export function GroupHandler(): express.Router {
  let router = express.Router();

  router.get('/', MGM.isUser, (req, res) => {
    GroupMgr.instance().getAllGroups().then((groups: Group[]) => {
      let result = [];
      for (let g of groups) {
        let r = {
          //ShowInList: g.ShowInList,
          //InsigniaID: g.InsigniaID.toString(),
          //MaturePublish: g.MaturePublish,
          FounderID: g.getFounder().toString(),
          EveryOnePowers: '?',
          OwnerRoleID: g.getOwnerRole().toString(),
          OwnerPowers: '?',
          uuid: g.getGroupID().toString(),
          name: g.getName(),
          members: [],
          roles: []
        };
        for (let m of g.getMembers()) {
          r.members.push({
            OwnerID: m.AgentID
          });
        }
        for (let m of g.getRoles()) {
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

  router.post('/removeUser/:id', MGM.isAdmin, (req,res) => {
    let groupID = new UUIDString(req.params.id);
    let userID = new UUIDString(req.body.user);
    let user: User;

    console.log('Removing user ' + userID + ' from group');

    UserMgr.instance().getUser(userID).then( (u: User) => {
      user = u;
      return GroupMgr.instance().getGroup(groupID);
    }).then( (g: Group) => {
      return g.removeMember(user);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  router.post('/addUser/:id', MGM.isAdmin, (req, res) => {
    let groupID = new UUIDString(req.params.id);
    let userID = new UUIDString(req.body.user);
    let roleID = new UUIDString(req.body.role);

    let user: User;

    console.log('Placing user ' + userID + ' into group ' + groupID + ' with role ' + roleID);

    UserMgr.instance().getUser(userID).then( (u: User) => {
      user = u;
      return GroupMgr.instance().getGroup(groupID);
    }).then( (g: Group) => {
      for(let u of g.getMembers()){
        if( u.AgentID.toString() === userID.toString()){
          throw new Error('User is already a member of that group');
        }
      }
      let roleExists = false;
      for( let r of g.getRoles()){
        if(r.RoleID.toString() === roleID.toString()){
          roleExists = true;
        }
      }
      if(!roleExists){
        throw new Error('That role does not exist on group ' + g.getName());
      }
      return g;
    }).then( (g : Group) => {
      return g.addMember(user, roleID);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  return router;
}
