
import * as express from 'express';
import { PersistanceLayer, HostInstance } from '../database';
import { IHost } from '../common/messages';
import { AuthenticatedRequest } from '.';

export function HostHandler(db: PersistanceLayer, isUser, isAdmin): express.Router {
  let router = express.Router();

  router.get('/', isAdmin, (req: AuthenticatedRequest, res) => {
    db.Hosts.getAll().then((hosts: HostInstance[]) => {
      res.json({
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
      });
    });
  });

  router.post('/add', isAdmin, (req: AuthenticatedRequest, res) => {
    let host: string = req.body.host || '';
    if (host === '') {
      res.json({ Success: false, Message: 'Invalid host' });
      return;
    }

    db.Hosts.create(host).then((h: HostInstance) => {
      res.json({ Success: true, ID: h.id });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  router.post('/remove', isAdmin, (req: AuthenticatedRequest, res) => {
    let host: string = req.body.host || '';

    db.Hosts.getByAddress(host).then( (h: HostInstance) => {
      return h.destroy();
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  return router;
}
