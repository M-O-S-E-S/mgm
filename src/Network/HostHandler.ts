import { RequestHandler } from 'express';
import { IHost, Store } from '../Store';
import { AuthenticatedRequest } from './Authorizer';

import { Response, GetHostsResponse } from './ClientStack';

export function GetHostHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    store.Hosts.getAll()
      .then((hosts: IHost[]) => {
        res.json(<GetHostsResponse>{
          Success: true,
          Hosts: hosts
        });
      }).catch((err: Error) => {
        res.json({
          Success: false,
          Message: err.message
        });
      });
  }
}