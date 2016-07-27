import * as express from 'express';

import { MGM } from '../MGM';
import { Estate, EstateMgr } from '../../halcyon/Estate';
import { User, UserMgr } from '../../halcyon/User';
import { UUIDString } from '../../halcyon/UUID';


export interface Halcyon {
  getEstates(): Promise<Estate[]>
  getUser(UUIDString): Promise<User>
  insertEstate(Estate): Promise<void>
  getEstate(number): Promise<Estate>
  destroyEstate(Estate): Promise<void>
}

export function EstateHandler(): express.Router {
  let router = express.Router();

  router.get('/', MGM.isUser, (req, res) => {
    EstateMgr.instance().getAllEstates().then((estates: Estate[]) => {
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

  router.post('/create', MGM.isAdmin, (req, res) => {
    let estateName = req.body.name;
    let owner = new UUIDString(req.body.owner);

    if (estateName === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Estate name cannot be blank' }));
    }

    EstateMgr.instance().getAllEstates().then((estates: Estate[]) => {
      for (let e of estates) {
        if (e.name === estateName) {
          throw new Error('An estate with that name already exists');
        }
      }
    }).then(() => {
      return UserMgr.instance().getUser(owner);
    }).then((u: User) => {
      return EstateMgr.instance().createEstate(estateName, owner);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/destroy/:id', MGM.isAdmin, (req, res) => {
    let estateID = req.params.id;

    EstateMgr.instance().getEstate(estateID).then( (e: Estate) => {
      if(e.regions.length !== 0) throw new Error('Estate ' + e.name + ' contains regions');
      return EstateMgr.instance().destroyEstate(e);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
