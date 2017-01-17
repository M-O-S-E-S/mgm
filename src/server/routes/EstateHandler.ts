import * as express from 'express';

import { PersistanceLayer, UserInstance, EstateInstance, ManagerInstance, EstateMapInstance } from '../database';
import { IEstate, IManager, IEstateMap } from '../../common/messages';

export function EstateHandler(db: PersistanceLayer, isUser: any, isAdmin: any): express.Router {
  let router = express.Router();

  router.get('/', isUser, (req, res) => {
    let iEstates: IEstate[] = [];
    let iManagers: IManager[] = [];
    let estateMap: IEstateMap[] = [];

    db.Estates.getAll().then((estates: EstateInstance[]) => {
      iEstates = estates.map((e: EstateInstance) => {
        let estate: IEstate = {
          id: e.EstateID,
          name: e.EstateName,
          owner: e.EstateOwner
        }
        return estate;
      });
    }).then(() => {
      return db.Estates.getManagers();
    }).then((managers: ManagerInstance[]) => {
      iManagers = managers.map((m: ManagerInstance) => {
        let manager: IManager = {
          estate: m.EstateId,
          id: m.ID,
          uuid: m.uuid
        }
        return manager;
      })
    }).then(() => {
      return db.Estates.getMapping();
    }).then((regs: EstateMapInstance[]) => {
      estateMap = regs.map((r: EstateMapInstance) => {
        let region: IEstateMap = {
          region: r.RegionID,
          estate: r.EstateID
        }
        return region;
      });
    }).then(() => {
      res.send(JSON.stringify({
        Success: true,
        Estates: iEstates,
        Managers: iManagers,
        Map: estateMap
      }));
    })
  });

  router.post('/create', isAdmin, (req, res) => {
    let estateName = req.body.name;
    let owner = req.body.owner;

    if (estateName === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Estate name cannot be blank' }));
    }

    db.Estates.getAll().then((estates: EstateInstance[]) => {
      for (let e of estates) {
        if (e.EstateName === estateName) {
          throw new Error('An estate with that name already exists');
        }
      }
    }).then(() => {
      return db.Users.getByID(owner);
    }).then((u: UserInstance) => {
      return db.Estates.create(estateName, owner);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/destroy/:id', isAdmin, (req, res) => {
    let estateID = req.params.id;

    db.Estates.destroy(estateID).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
