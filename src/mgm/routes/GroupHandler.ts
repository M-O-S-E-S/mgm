
import * as express from 'express';

import { Group } from '../../halcyon/group';

export interface Halcyon {
  getGroups(): Promise<Group[]>
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


  router.post('/addUser/:id', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  return router;
}
