import { Response, RequestHandler } from 'express';
import { IEstate, IManager, IEstateMap, IUser } from '../types';
import { Store } from '../Store';
import { AuthenticatedRequest } from '../Auth';

export function GetEstatesHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res: Response) => {
    let outEstates: IEstate[];
    let outManagers: IManager[];
    let outMap: IEstateMap[];
    store.Estates.getAll().then((estates: IEstate[]) => {
      outEstates = estates.filter((e: IEstate) => {
        return req.user.isAdmin || req.user.estates.has(e.EstateID);
      });
      return store.Estates.getManagers();
    }).then((managers: IManager[]) => {
      outManagers = managers.filter((m: IManager) => {
        return req.user.isAdmin ||  req.user.estates.has(m.EstateID);
      });
      return store.Estates.getMapping();
    }).then((regs: IEstateMap[]) => {
      outMap = regs.filter((r: IEstateMap) => {
        return req.user.isAdmin || req.user.estates.has(r.EstateID);
      })
      res.json({
        Success: true,
        Estates: outEstates,
        Managers: outManagers,
        EstateMap: outMap
      });
    });
  }
}

export function CreateEstateHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res: Response) => {
    let name: string = req.body.name;
    let ownerID: string = req.body.owner
    store.Users.getByID(ownerID).then((u: IUser) => {
      // user exists, check estate name
      return store.Estates.getAll();
    }).then((estates: IEstate[]) => {
      estates.map((e: IEstate) => {
        if (e.EstateName.toLowerCase() === name.toLowerCase()) {
          throw new Error('An estate named ' + name + ' Already Exists');
        }
      });
      return store.Estates.create(name, ownerID);
    }).then((estate: IEstate) => {
      res.json({ Success: true, EstateID: estate.EstateID });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  }
}

export function DeleteEstateHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res: Response) => {
    let estateID = req.params.id;

    store.Estates.destroy(estateID).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}