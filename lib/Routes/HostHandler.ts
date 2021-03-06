import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IHost } from '../types';
import { AuthenticatedRequest } from '../Auth';
import Promise = require('bluebird');
import { PerformanceStore } from '../Performance';

export function GetHostHandler(store: Store, perf: PerformanceStore): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    store.Hosts.getAll().then((hosts: IHost[]) => {
      return Promise.all(hosts.map((h: IHost) => {
        return perf.getHostData(h).then((data: string) => {
          h.status = data;
        });
      })).then(() => { return hosts; })
    }).then((hosts: IHost[]) => {
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

export function AddHostHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    let host: string = req.body.host;
    if (host === '') {
      return res.json({ Success: false, Message: 'Invalid host' });
    }

    store.Hosts.create(host).then((h: IHost) => {
      res.json({ Success: true, HostID: h.id });
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