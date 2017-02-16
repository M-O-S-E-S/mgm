import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IHost } from '../Types';
import { AuthenticatedRequest } from './Authorizer';

import { Response, GetHostsResponse } from '../View/ClientStack';

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