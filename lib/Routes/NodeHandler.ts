import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IRegion, IJob, IUser, IHost } from '../types';
import { AuthenticatedRequest } from '../Auth';
import { RegionLogs } from '../regionLogs';
import { RegionINI } from '../Region';
import { Config } from '../Config';
import Promise = require('bluebird');

export function NodeLogHandler(store: Store, logger: RegionLogs): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;

    let remoteIP: string = req.ip.split(':').pop();
    store.Hosts.getByAddress(remoteIP).then(() => {
      return store.Regions.getByUUID(regionID.toString())
    }).then((r: IRegion) => {
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
    let remoteIP: string = req.ip.split(':').pop();
    store.Hosts.getByAddress(remoteIP).then( (node: IHost) => {
      return store.Regions.getByNode(node);
    }).then((regions: IRegion[]) => {
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

    let remoteIP: string = req.ip.split(':').pop();
    store.Hosts.getByAddress(remoteIP).then((node: IHost) => {
      return store.Hosts.setStatus(node, JSON.stringify(stats.host));
    }).then(() => {
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

export function RegionConfigHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let uuid = req.params.id;
    //validate host
    let remoteIP: string = req.ip.split(':').pop();
    store.Hosts.getByAddress(remoteIP).then( () => {
      return store.Regions.getByUUID(uuid.toString());
    }).then((r: IRegion) => {
      if (r.node === remoteIP) {
        return r;
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: IRegion) => {
      res.json({
        Success: true,
        Region: {
          Name: r.name,
          RegionUUID: r.uuid,
          LocationX: r.x,
          LocationY: r.y,
          InternalPort: r.port,
          ExternalHostName: r.node
        }
      });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
      return;
    });
  };
}

export function IniConfigHandler(store: Store, config: Config): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let uuid = req.params.id;
    let httpPort = req.query['httpPort'];
    let externalAddress = req.query['externalAddress'];
    //validate host
    let remoteIP: string = req.ip.split(':').pop();
    store.Hosts.getByAddress(remoteIP).then( () => {
      return store.Regions.getByUUID(uuid.toString());
    }).then((r: IRegion) => {
      if (r.node === remoteIP) {
        return store.Regions.setPortAndAddress(r, parseInt(httpPort), externalAddress);
      }
      throw new Error('Requested region does not exist on the requesting host');
    }).then((r: IRegion) => {
      return RegionINI(r, config);
    }).then((config: { [key: string]: { [key: string]: string } }) => {
      res.json({ Success: true, Region: config });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
      return;
    });
  };
}

export function NodeDownloadHandler(store: Store, defaultOar: string): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let jobID = parseInt(req.params.id);

    store.Jobs.getByID(jobID).then((j: IJob) => {
      switch (j.type) {
        case 'load_oar':
          let datum = JSON.parse(j.data);
          res.sendFile(datum.File);
        case 'nuke':
          res.sendFile(defaultOar);
      }

    }).catch((err) => {
      console.log('An error occurred sending a file to a user: ' + err);
    });
  };
}

export function NodeReportHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let taskID = parseInt(req.params.id);

    store.Jobs.getByID(taskID).then((j: IJob) => {
      let datum = JSON.parse(j.data);
      datum.Status = req.body.Status;
      return store.Jobs.setData(j, JSON.stringify(datum));
    }).then(() => {
      res.send('OK');
    }).catch((err) => {
      console.log(err);
    });
  };
}

interface uploadRequest extends AuthenticatedRequest {
  file: {
    path: string
    originalname: string
    size: string
  }
}
import { EmailMgr } from '../Email';

export function NodeUploadHandler(store: Store): RequestHandler {
  return (req: uploadRequest, res) => {
    let taskID = parseInt(req.params.id);

    console.log('upload file received for job ' + taskID);

    store.Jobs.getByID(taskID).then((j: IJob) => {
      switch (j.type) {
        case 'save_oar':
          let remoteIP: string = req.ip.split(':').pop();
          let fileName: string;
          return Promise.resolve().then(() => {
            let datum = JSON.parse(j.data);
            datum.Status = 'Done';
            datum.File = req.file.path;
            datum.FileName = req.file.originalname;
            datum.Size = req.file.size;
            fileName = datum.FileName;
            return store.Jobs.setData(j, JSON.stringify(datum));
          }).then(() => {
            return store.Users.getByID(j.user);
          }).then((u: IUser) => {
            return EmailMgr.instance().sendSaveOarComplete(u.email, fileName);
          })
        default:
          throw new Error('invalid upload for job type: ' + j.type);
      }
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      console.log(err);
      res.json({ Success: false, Message: err.message });
    });
  };
}