import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IHost } from '../Types';
import { AuthenticatedRequest } from '../Auth';

import { Response, GetHostsResponse, AddHostResponse } from '../View/ClientStack';

export function GetHostHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    store.Hosts.getAll().then((hosts: IHost[]) => {
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

export function AddHostHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    let host: string = req.body.host;
    if (host === '') {
      return res.json({ Success: false, Message: 'Invalid host' });
    }

    store.Hosts.create(host).then((h: IHost) => {
      res.json(<AddHostResponse>{ Success: true, HostID: h.id });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    })
  }
}

export function RemoveHostHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    let host: number = parseInt(req.body.host);

    store.Hosts.destroy(host).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    })
  }
}