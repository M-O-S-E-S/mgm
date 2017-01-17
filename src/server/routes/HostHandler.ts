
import * as express from 'express';
import { PersistanceLayer, HostInstance } from '../database';
import { IHost } from '../../common/messages';

export function HostHandler(db: PersistanceLayer, isUser, isAdmin): express.Router {
  let router = express.Router();

  router.get('/', isAdmin, (req, res) => {
    db.Hosts.getAll().then((hosts: HostInstance[]) => {
      res.send(JSON.stringify({
        Success: true,
        Hosts: hosts.map(host => {
          let ih: IHost = {
            id: host.id,
            address: host.address,
            name: host.name,
            slots: host.slots,
            status: host.status
          }
          return ih;
        })
      }));
    });
  });

  router.post('/add', isAdmin, (req, res) => {
    let host: string = req.body.host || '';
    if (host === '') {
      res.send(JSON.stringify({ Success: false, Message: 'Invalid host' }));
      return;
    }

    db.Hosts.create(host).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/remove', isAdmin, (req, res) => {
    let host: string = req.body.host || '';

    db.Hosts.getByAddress(host).then( (h: HostInstance) => {
      return h.destroy();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
