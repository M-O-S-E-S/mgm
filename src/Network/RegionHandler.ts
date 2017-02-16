import { RequestHandler } from 'express';
import { IRegion, Store } from '../Store';
import { AuthenticatedRequest } from './Authorizer';
import { Set } from 'immutable';

import { Response, GetRegionsResponse } from './ClientStack';

export function GetRegionsHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res: Response) {
    store.Regions.getAll()
      .then((regions: IRegion[]) => {
        return regions.filter( (r: IRegion) => {
          return req.user.regions.has(r.uuid);
        });
      }).then((regions: IRegion[]) => {
        res.json(<GetRegionsResponse>{
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