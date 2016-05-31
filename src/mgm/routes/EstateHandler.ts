import * as express from 'express';

import { Estate } from '../../halcyon/Estate';
import { UUIDString } from '../../halcyon/UUID';


export interface Halcyon {
  getEstates(): Promise<Estate[]>
}

export function EstateHandler(hal: Halcyon): express.Router {
  let router = express.Router();

  router.get('/', (req, res) => {
    if (!req.cookies['uuid']) {
      res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
      return;
    }

    hal.getEstates().then((estates: Estate[]) => {
      let result: any[] = []
      for(let r of estates){
        result.push({
          id: r.id,
          name: r.name,
          owner: r.owner.toString(),
          managers: r.managers.map( (id: UUIDString) => { return id.toString(); }),
          regions: r.regions.map( (id: UUIDString) => { return id.toString(); }),
        });
      }
      res.send(JSON.stringify({
        Success: true,
        Estates: result
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({
        Success: false,
        Message: err.message
      }));
    })

  });

  router.post('/create', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/destroy/:id', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  return router;
}
