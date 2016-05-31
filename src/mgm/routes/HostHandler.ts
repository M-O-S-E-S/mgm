
import * as express from 'express';
import { Host } from '../host';
import { MGM } from '../MGM';

export function HostHandler(mgm: MGM): express.Router {
  let router = express.Router();

  router.get('/', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    if (req.cookies['userLevel'] < 250) {
      res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
      return;
    }

    mgm.getHosts().then((hosts: Host[]) => {
      res.send(JSON.stringify({
        Success: true,
        Hosts: hosts
      }));
    });
  });

  router.post('/add', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    if (req.cookies['userLevel'] < 250) {
      res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
      return;
    }

    let host: string = req.body.host || '';
    if (host === '') {
      res.send(JSON.stringify({ Success: false, Message: 'Invalid host' }));
      return;
    }

    mgm.insertHost(host).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/remove', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    if (req.cookies['userLevel'] < 250) {
      res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
      return;
    }

    let host: string = req.body.host || '';

    mgm.deleteHost(host).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
