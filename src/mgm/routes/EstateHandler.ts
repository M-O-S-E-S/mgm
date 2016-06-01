import * as express from 'express';

import { Estate } from '../../halcyon/estate';
import { User } from '../../halcyon/User';
import { UUIDString } from '../../halcyon/UUID';


export interface Halcyon {
  getEstates(): Promise<Estate[]>
  getUser(UUIDString): Promise<User>
  insertEstate(Estate): Promise<void>
  getEstate(number): Promise<Estate>
  destroyEstate(Estate): Promise<void>
}

export function EstateHandler(hal: Halcyon): express.Router {
  let router = express.Router();

  router.get('/', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    hal.getEstates().then((estates: Estate[]) => {
      let result: any[] = []
      for (let r of estates) {
        result.push({
          id: r.id,
          name: r.name,
          owner: r.owner.toString(),
          managers: r.managers.map((id: UUIDString) => { return id.toString(); }),
          regions: r.regions.map((id: UUIDString) => { return id.toString(); }),
        });
      }
      res.send(JSON.stringify({
        Success: true,
        Estates: result
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });

  });

  router.post('/create', (req, res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let estateName = req.body.name;
    let owner = new UUIDString(req.body.owner);

    if (estateName === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Estate name cannot be blank' }));
    }

    hal.getEstates().then((estates: Estate[]) => {
      for (let e of estates) {
        if (e.name === estateName) {
          throw new Error('An estate with that name already exists');
        }
      }
    }).then(() => {
      return hal.getUser(owner);
    }).then((u: User) => {
      let e: Estate = new Estate();
      e.name = estateName;
      e.owner = owner;
      return hal.insertEstate(e);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/destroy/:id', (req, res) => {
    if (!req.cookies['uuid']) {
      return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    }

    if (req.cookies['userLevel'] < 250) {
      return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    }

    let estateID = req.params.id;

    hal.getEstate(estateID).then( (e: Estate) => {
      if(e.regions.length !== 0) throw new Error('Estate ' + e.name + ' contains regions');
      return hal.destroyEstate(e);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
