
import * as express from 'express';
import * as path from "path";

import { MGM } from '../MGM';
import { Region } from '../Region';
import { Host } from '../host';
import { UUIDString } from '../../halcyon/UUID';

import fs = require("fs");

export function DispatchHandler(mgm: MGM, logDir: string): express.Router {
  let router: express.Router = express.Router();

  //ensure the directory for logs exists
  if (!fs.exists(logDir)) {
    fs.mkdir(path.join(logDir), (err) => {
      if (err && err.code !== "EEXIST")
        throw new Error('Cannot create region log directory at ' + logDir);
    });
  }

  router.post('/logs/:name', (req, res) => {
    let regionName = req.params.name;
    let remoteIP: string = req.ip.split(':').pop();
    mgm.getHost(remoteIP).then((host: Host) => {
      return mgm.getRegionByName(regionName);
    }).then((r: Region) => {
      let logs: string[] = JSON.parse(req.body.log);
      fs.appendFile(path.join(logDir, r.name), logs.join('\n'));
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      console.log('Error serving logs for host ' + remoteIP + ': ' + err.message);
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/stats/:host', (req, res) => {
    let host = req.params.host; //url parameter, not relaly used
    let remoteIP: string = req.ip.split(':').pop();
    mgm.getHost(remoteIP).then((host: Host) => {
      //this is from mgmNode, which isnt following the rules
      let stats = JSON.parse(req.body.json);
      let hostStatus = JSON.stringify(stats.host);

      let workers = [];
      workers.push(mgm.updateHostStats(host, hostStatus));

      let halted = 0;
      let running = 0;
      for (let proc of stats.processes) {
        let w = mgm.getRegionByName(proc.name).then((r: Region) => {
          r.isRunning = proc.running.toUpperCase() === 'FALSE' ? false : true;
          if (r.isRunning)
            running++;
          else
            halted++;
          return mgm.updateRegionStats(r, proc.running.toUpperCase() === 'FALSE' ? false : true, JSON.stringify(proc.stats));
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


  router.get('/region/:name', (req, res) => {
    let regionName = req.params.name;
    //validate host
    let remoteIP: string = req.ip.split(':').pop();
    mgm.getHost(remoteIP).then((host: Host) => {
      //get region on host
      return mgm.getRegionsOn(host);
    }).then((regions: Region[]) => {
      for (let r of regions) {
        if (r.name === regionName) {
          return r;
        }
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: Region) => {
      res.send(JSON.stringify({
        Success: true,
        Region: {
          RegionUUID: r.uuid.toString(),
          LocationX: r.locX,
          LocationY: r.locY,
          InternalPort: r.httpPort,
          ExternalHostName: r.externalAddress
        }
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
      return;
    });
  });

  router.get('/process/:name', (req, res) => {
    let regionName = req.params.name;
    let httpPort = req.query.httpPort;
    let consolePort = req.query.consolePort;
    let externalAddress = req.query.externalAddress;
    //validate host
    let remoteIP: string = req.ip.split(':').pop();
    mgm.getHost(remoteIP).then((host: Host) => {
      //get region on host
      return mgm.getRegionsOn(host);
    }).then((regions: Region[]) => {
      for (let r of regions) {
        if (r.name === regionName) {
          return r;
        }
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: Region) => {
      r.httpPort = httpPort;
      r.consolePort = consolePort;
      r.externalAddress = externalAddress;
      return mgm.updateRegion(r);
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
    mgm.getHost(remoteIP).then((host: Host) => {
      console.log('Received registration for node at ' + remoteIP);
      let payload = req.body;

      host.slots = payload.slots;
      host.name = payload.host;
      host.port = payload.port;
      host.cmd_key = new UUIDString(payload.key);

      return host;
    }).then((h: Host) => {
      return mgm.updateHost(h);
    }).then((h: Host) => {
      return mgm.getRegionsOn(h);
    }).then((regions: Region[]) => {
      let result = []
      for (let r of regions) {
        result.push({
          name: r.name,
          uuid: r.uuid.toString(),
          locX: r.locX,
          locY: r.locY,
          size: r.size
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
