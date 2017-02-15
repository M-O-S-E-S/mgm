import { Response, RequestHandler } from 'express';
import { Estate, Manager, EstateMap, Store } from '../Store';
import { NetworkResponse, AuthenticatedRequest } from './messages';


export function GetEstatesHander(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    let outEstates: Estate[];
    let outManagers: Manager[];
    let outMap: EstateMap[];
    store.Estates.getAll()
      .then((estates: Estate[]) => {
        outEstates = estates.filter((e: Estate) => {
          return req.user.estates.has(e.EstateID);
        });
        return store.Estates.getManagers();
      }).then((managers: Manager[]) => {
        outManagers = managers.filter((m: Manager) => {
          return req.user.estates.has(m.EstateID);
        });
        return store.Estates.getMapping();
      }).then((regs: EstateMap[]) => {
        outMap = regs.filter( (r: EstateMap) => {
          return req.user.estates.has(r.EstateID);
        })
        res.json({
          Success: true,
          Estates: outEstates,
          Managers: outManagers,
          Map: outMap
        });
      })
  }
}