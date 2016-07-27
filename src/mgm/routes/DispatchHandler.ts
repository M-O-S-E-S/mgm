
import * as express from 'express';

import { MGM } from '../MGM';
import { Region, RegionMgr } from '../Region';
import { Host, HostMgr } from '../Host';
import { UUIDString } from '../../halcyon/UUID';
import { RegionLogs } from '../util/regionLogs';

export function DispatchHandler(mgm: MGM): express.Router {
  let router: express.Router = express.Router();

  router.post('/logs/:uuid', (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let remoteIP: string = req.ip.split(':').pop();
    RegionMgr.instance().getRegion(regionID)
      .then((r: Region) => {
        let logs: string[] = JSON.parse(req.body.log);
        return RegionLogs.instance().append(r.getUUID(), logs);
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
    HostMgr.instance().get(remoteIP).then((host: Host) => {
      //this is from mgmNode, which isnt following the rules
      let stats = JSON.parse(req.body.json);
      let hostStatus = JSON.stringify(stats.host);

      let workers = [];
      host.setStatus(hostStatus);

      let halted = 0;
      let running = 0;
      for (let proc of stats.processes) {
        let w = RegionMgr.instance().getRegion(new UUIDString(proc.id)).then((r: Region) => {
          if (proc.running.toUpperCase() === 'FALSE' ? false : true)
            running++;
          else
            halted++;
          r.setRunning(proc.running.toUpperCase() === 'FALSE' ? false : true);
          r.setStats(proc.stats)
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
    RegionMgr.instance().getRegion(uuid).then((r: Region) => {
      if (r.getNodeAddress() === remoteIP) {
        return r;
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: Region) => {
      res.send(JSON.stringify({
        Success: true,
        Region: {
          Name: r.getName(),
          RegionUUID: r.getUUID().toString(),
          LocationX: r.getX(),
          LocationY: r.getY(),
          InternalPort: r.getPort(),
          ExternalHostName: r.getExternalAddress()
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
    RegionMgr.instance().getRegion(uuid).then((r: Region) => {
      if (r.getNodeAddress() === remoteIP) {
        return r;
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: Region) => {
      return r.setPort(httpPort);
    }).then((r: Region) => {
      return r.setExternalAddress(externalAddress);
    }).then((r: Region) => {
      return mgm.getRegionINI(r);
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
    HostMgr.instance().get(remoteIP).then((host: Host) => {
      console.log('Received registration for node at ' + remoteIP);
      return host.setPort(payload.port)
    }).then((h: Host) => {
      return h.setName(payload.host);
    }).then((h: Host) => {
      return h.setSlots(payload.slots);
    }).then((h: Host) => {
      return RegionMgr.instance().getRegionsOn(h);
    }).then((regions: Region[]) => {
      let result = []
      for (let r of regions) {
        result.push({
          name: r.getName(),
          uuid: r.getUUID().toString(),
          locX: r.getX(),
          locY: r.getY()
        });
      }
      res.send(JSON.stringify({
        Success: true,
        Regions: result
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
      return;
    });
  });

  return router;
}
