import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IRegion } from '../Types';
import { AuthenticatedRequest } from '../Auth';
import { RegionLogs } from '../lib';

//let remoteIP: string = req.ip.split(':').pop();

export function NodeLogHandler(store: Store, logger: RegionLogs): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;

    store.Regions.getByUUID(regionID.toString()).then((r: IRegion) => {
      let logs: string[] = JSON.parse(req.body.log);
      return logger.append(r, logs);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function NodeHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let payload = req.body;
    store.Regions.getByNode(req.node).then((regions: IRegion[]) => {
      let result = []
      for (let r of regions) {
        result.push({
          name: r.name,
          uuid: r.uuid,
          locX: r.x,
          locY: r.y
        });
      }
      return res.json({
        Success: true,
        Regions: result
      });
    }).catch((err: Error) => {
      return res.json({ Success: false, Message: err.message });
    });
  };
}


interface hostStat {
  cpuPercent: number[],
  timestamp: Date,
  netSentPer: number,
  netRecvPer: number,
  memPercent: number,
  memKB: number
}

interface procStat {
  id: string
  running: boolean,
  stats: {
    timestamp: Date
  }
}

interface statUpload {
  host: hostStat,
  processes: procStat[]
}


export function NodeStatHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let stats: statUpload = JSON.parse(req.body.json);
    let running = 0;
    let halted = 0;

    store.Hosts.setStatus(req.node, JSON.stringify(stats.host)).then(() => {
      return Promise.all(
        stats.processes.map((proc: procStat) => {
          if (proc.running)
            running++;
          else
            halted++;
          return store.Regions.getByUUID(proc.id).then((r: IRegion) => {
            return store.Regions.setStatus(r, proc.running, JSON.stringify(proc.stats));
          });
        })
      );
    }).then(() => {
      res.send('Stats recieved: ' + running + ' running processes, and ' + halted + ' halted processes');
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

/*
export function DispatchHandler(db: Store, config: Config): express.Router {
  let router: express.Router = express.Router();

  let logger = new RegionLogs(config.mgm.log_dir);

  router.get('/region/:id', (req, res) => {
    let uuid = new UUIDString(req.params.id);
    //validate host
    let remoteIP: string = req.ip.split(':').pop();
    db.Regions.getByUUID(uuid.toString()).then((r: RegionInstance) => {
      if (r.slaveAddress === remoteIP) {
        return r;
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: RegionInstance) => {
      res.json({
        Success: true,
        Region: {
          Name: r.name,
          RegionUUID: r.uuid,
          LocationX: r.locX,
          LocationY: r.locY,
          InternalPort: r.httpPort,
          ExternalHostName: r.slaveAddress
        }
      });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
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
      r.externalAddress = externalAddress;
      r.save();
      return RegionINI(r, config);
    }).then((config: { [key: string]: { [key: string]: string } }) => {
      res.json({ Success: true, Region: config });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
      return;
    });
  });

  return router;
}
*/