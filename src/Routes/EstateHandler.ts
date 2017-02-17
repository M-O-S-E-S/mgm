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