
import * as express from 'express';
import { Host, HostMgr } from '../Host';
import { MGM } from '../MGM';

export function HostHandler(mgm: MGM): express.Router {
  let router = express.Router();

  router.get('/', MGM.isAdmin, (req, res) => {
    HostMgr.instance().getAll().then((hosts: Host[]) => {
      res.send(JSON.stringify({
        Success: true,
        Hosts: hosts.map( host => {
          return {
            address: host.getAddress(),
            name: host.getName(),
            slots: host.getSlots(),
            status: host.getStatus()
          }
        })
      }));
    });
  });

  router.post('/add', MGM.isAdmin, (req, res) => {
    let host: string = req.body.host || '';
    if (host === '') {
      res.send(JSON.stringify({ Success: false, Message: 'Invalid host' }));
      return;
    }

    HostMgr.instance().insert(host).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/remove', MGM.isAdmin,  (req, res) => {
    let host: string = req.body.host || '';

    HostMgr.instance().delete(host).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
