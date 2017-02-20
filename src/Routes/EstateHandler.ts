import { RequestHandler } from 'express';
import { IEstate, IManager, IEstateMap } from '../Types';
import { Store } from '../Store';
import { AuthenticatedRequest } from './Authorizer';

import { Response, GetEstatesResponse } from '../View/ClientStack';

export function GetEstatesHander(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    let outEstates: IEstate[];
    let outManagers: IManager[];
    let outMap: IEstateMap[];
    store.Estates.getAll()
      .then((estates: IEstate[]) => {
        outEstates = estates.filter((e: IEstate) => {
          return req.user.estates.has(e.EstateID);
        });
        return store.Estates.getManagers();
      }).then((managers: IManager[]) => {
        outManagers = managers.filter((m: IManager) => {
          return req.user.estates.has(m.EstateID);
        });
        return store.Estates.getMapping();
      }).then((regs: IEstateMap[]) => {
        outMap = regs.filter( (r: IEstateMap) => {
          return req.user.estates.has(r.EstateID);
        })
        res.json(<GetEstatesResponse>{
          Success: true,
          Estates: outEstates,
          Managers: outManagers,
          EstateMap: outMap
        });
      });
  }
}

/*
export function EstateHandler(db: PersistanceLayer, isUser: any, isAdmin: any): express.Router {
  let router = express.Router();

  router.get('/', isUser, (req: AuthenticatedRequest, res) => {
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
      res.json({
        Success: true,
        Estates: iEstates,
        Managers: iManagers,
        Map: estateMap
      });
    })
  });

  router.post('/create', isAdmin, (req: AuthenticatedRequest, res) => {
    let estateName = req.body.name;
    let owner = req.body.owner;

    if (estateName === '') {
      return res.json({ Success: false, Message: 'Estate name cannot be blank' });
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
    }).then((e: EstateInstance) => {
      res.json({ Success: true, ID: e.EstateID });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  router.post('/destroy/:id', isAdmin, (req: AuthenticatedRequest, res) => {
    let estateID = req.params.id;

    db.Estates.destroy(estateID).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  return router;
}
*/