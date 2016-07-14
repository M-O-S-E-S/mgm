
import * as express from 'express';
import { Host } from '../Host';
import { MGM } from '../MGM';

export function HostHandler(mgm: MGM): express.Router {
  let router = express.Router();

  router.get('/', MGM.isAdmin, (req, res) => {
    mgm.getHosts().then((hosts: Host[]) => {
      res.send(JSON.stringify({
        Success: true,
        Hosts: hosts
      }));
    });
  });

  router.post('/add', MGM.isAdmin, (req, res) => {
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

  router.post('/remove', MGM.isAdmin,  (req, res) => {
    let host: string = req.body.host || '';

    mgm.deleteHost(host).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
