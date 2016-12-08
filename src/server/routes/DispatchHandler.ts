
import * as express from 'express';

import { PersistanceLayer, RegionInstance, HostInstance } from '../database';
import { UUIDString } from '../util/UUID';
import { RegionLogs } from '../util/regionLogs';
import { RegionINI } from '../util/Region';
import { Config } from '../config'; 

export function DispatchHandler(db: PersistanceLayer, config: Config): express.Router {
  let router: express.Router = express.Router();

  router.post('/logs/:uuid', (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let remoteIP: string = req.ip.split(':').pop();
    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
        let logs: string[] = JSON.parse(req.body.log);
        return RegionLogs.instance().append(new UUIDString(r.uuid), logs);
      }).then(() => {
        res.send(JSON.stringify({ Success: true }));
      }).catch((err: Error) => {
        console.log('Error handling logs for host ' + remoteIP + ': ' + err.message);
        res.send(JSON.stringify({ Success: false, Message: err.message }));
      });
  });

  router.post('/stats/:host', (req, res) => {
    let host = req.params.host; //url parameter, not relaly used
    let remoteIP: string = req.ip.split(':').pop();
    db.Hosts.getByAddress(remoteIP).then( (h: HostInstance) => {
      //this is from mgmNode, which isnt following the rules
      let stats = JSON.parse(req.body.json);

      let workers = [];
      host.setStatus(stats.host);

      let halted = 0;
      let running = 0;
      for (let proc of stats.processes) {
        let w = db.Regions.getByUUID(proc.id).then((r: RegionInstance) => {
          if (proc.running.toUpperCase() === 'FALSE' ? false : true)
            running++;
          else
            halted++;
          r.isRunning = proc.running.toUpperCase() === 'FALSE' ? false : true;
          r.status = proc.stats;
          r.save();
        });
        workers.push(w);
      }

      return Promise.all(workers).then(() => {
        res.send('Stats recieved: ' + running + ' running processes, and ' + halted + ' halted processes');
      });

    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });


  router.get('/region/:id', (req, res) => {
    let uuid = new UUIDString(req.params.id);
    //validate host
    let remoteIP: string = req.ip.split(':').pop();
    db.Regions.getByUUID(uuid.toString()).then( (r: RegionInstance) => {
      if (r.slaveAddress === remoteIP) {
        return r;
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: RegionInstance) => {
      res.send(JSON.stringify({
        Success: true,
        Region: {
          Name: r.name,
          RegionUUID: r.uuid,
          LocationX: r.locX,
          LocationY: r.locY,
          InternalPort: r.httpPort,
          ExternalHostName: r.slaveAddress
        }
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
      return;
    });
  });

  router.get('/process/:id', (req, res) => {
    let uuid = new UUIDString(req.params.id);
    let httpPort = req.query.httpPort;
    let consolePort = req.query.consolePort;
    let externalAddress = req.query.externalAddress;
    //validate host
    let remoteIP: string = req.ip.split(':').pop();
    db.Regions.getByUUID(uuid.toString()).then((r: RegionInstance) => {
      if (r.slaveAddress === remoteIP) {
        return r;
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: RegionInstance) => {
      r.httpPort = httpPort;
      r.slaveAddress = externalAddress;
      r.save();
      return RegionINI(r, config);
    }).then((config: { [key: string]: { [key: string]: string } }) => {
      res.send(JSON.stringify({ Success: true, Region: config }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
      return;
    });
  });


  router.post('/node', (req, res) => {
    let remoteIP: string = req.ip.split(':').pop();
    let payload = req.body;
    db.Hosts.getByAddress(remoteIP).then( (h: HostInstance) => {
      console.log('Received registration for node at ' + remoteIP);
      h.port = payload.port;
      h.name = payload.host;
      h.slots = payload.slots;
      return h.save();
    }).then((h: HostInstance) => {
      return db.Regions.getBySlave(h.address);
    }).then((regions: RegionInstance[]) => {
      let result = []
      for (let r of regions) {
        result.push({
          name: r.name,
          uuid: r.uuid,
          locX: r.locX,
          locY: r.locY
        });
      }
      return res.send(JSON.stringify({
        Success: true,
        Regions: result
      }));
    }).catch((err: Error) => {
      console.log(err.stack);
      return res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
