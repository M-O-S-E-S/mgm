import { Response, RequestHandler } from 'express';
import { Host, Store } from '../Store';
import { NetworkResponse, AuthenticatedRequest } from './messages';


export function GetHostHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    store.Hosts.getAll()
      .then((hosts: Host[]) => {
        res.json({
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