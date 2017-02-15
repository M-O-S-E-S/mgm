import { Response, RequestHandler } from 'express';
import { Region, Store } from '../Store';
import { NetworkResponse, AuthenticatedRequest } from './messages';
import { Set } from 'immutable';

export function GetRegionsHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    store.Regions.getAll()
      .then((regions: Region[]) => {
        return regions.filter( (r: Region) => {
          return req.user.regions.has(r.uuid);
        });
      }).then((regions: Region[]) => {
        res.json({
          Success: true,
          Regions: regions
        });
      }).catch((err: Error) => {
        res.json({
          Success: false,
          Message: err.message
        });
      });
  }
}