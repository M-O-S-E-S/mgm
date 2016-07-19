
import * as express from 'express';

import { Region } from '../Region';
import { Host } from '../Host';
import { Estate } from '../../halcyon/estate';
import { UUIDString } from '../../halcyon/UUID';
import { MGM } from '../MGM';
import { AdminSession, RemoteAdmin } from '../../halcyon/RemoteAdmin';
import { RegionLogs } from '../util/regionLogs';

export interface Halcyon {
  getEstate(number): Promise<Estate>
  getEstates(): Promise<Estate[]>
  destroyRegion(string): Promise<void>
  setEstateForRegion(string, Estate): Promise<void>
}

export interface ConsoleSettings {
  user: string,
  pass: string
}

export function RegionHandler(mgm: MGM, hal: Halcyon, conf: ConsoleSettings): express.Router {
  let router = express.Router();

  router.get('/', MGM.isUser, (req, res) => {
    let regions: Region[];
    let w;
    if (req.cookies['userLevel'] >= 250) {
      w = mgm.getAllRegions();
    } else {
      w = mgm.getRegionsFor(new UUIDString(req.cookies['uuid']));
    }
    w.then((rs: Region[]) => {
      regions = rs;
      return hal.getEstates();
    }).then((estates: Estate[]) => {
      let result = [];
      for (let r of regions) {
        let estateName: string = '';
        for (let e of estates) {
          for (let reg of e.regions) {
            if (reg.toString() === r.uuid.toString()) {
              estateName = e.name;
            }
          }
        }
        r.status['simStats'] = { 'Uptime': r.status.uptime };
        result.push({
          uuid: r.uuid.toString(),
          name: r.name,
          x: r.locX,
          y: r.locY,
          size: r.size,
          estateName: estateName,
          status: r.status,
          node: r.slaveAddress ? r.slaveAddress : '',
          isRunning: r.isRunning,
        });
      }

      res.send(JSON.stringify({
        Success: true,
        Regions: result
      }));
    });
  });

  router.get('/logs/:uuid', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);

    mgm.getRegion(regionID).then((r: Region) => {
      res.sendFile(RegionLogs.instance().getFilePath(r.uuid))
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/destroy/:uuid', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let region: Region;

    mgm.getRegion(regionID).then((r: Region) => {
      if (r.isRunning) {
        return res.send(JSON.stringify({ Success: false, Message: 'cannot delete a running region' }));
      }
      if (r.slaveAddress !== null) {
        return res.send(JSON.stringify({ Success: false, Message: 'region is still allocated a host' }));
      }
      region = r;
    }).then(() => {
      return mgm.destroyRegion(region);
    }).then(() => {
      return hal.destroyRegion(region.uuid.toString());
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/estate/:uuid', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let estateID: number = parseInt(req.body.estate);

    let estate: Estate;

    hal.getEstate(estateID).then((e: Estate) => {
      estate = e;
      return mgm.getRegion(regionID);
    }).then((r: Region) => {
      return hal.setEstateForRegion(r.uuid.toString(), estate);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/setXY/:uuid', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let region: Region;
    let x = parseInt(req.body.x);
    let y = parseInt(req.body.y);

    mgm.getRegion(regionID).then((r: Region) => {
      if (r.isRunning) throw new Error('Cannot move a region while it is running');
      if (r.locX === x && r.locY === y) throw new Error('Region is already at those coordinates');
      region = r;
      return mgm.getAllRegions();
    }).then((regions: Region[]) => {
      for (let r of regions) {
        if (r.uuid === region.uuid) {
          continue;
        }
        if (r.locX === x && r.locY === y) throw new Error('Region ' + r.name + ' is already at those coordinates');
      }
    }).then(() => {
      return mgm.setRegionCoordinates(region, x, y);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/create', MGM.isAdmin, (req, res) => {
    let region: Region = new Region();
    region.name = req.body.name;
    region.size = req.body.size;
    region.locX = req.body.x;
    region.locY = req.body.y;
    let estateID = req.body.estate;
    let estate: Estate;

    hal.getEstate(estateID).then((e: Estate) => {
      estate = e;
      return mgm.insertRegion(region);
    }).then((r: Region) => {
      region = r;
      return hal.setEstateForRegion(region.uuid.toString(), estate);
    }).then(() => {
      return res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/host/:regionID', MGM.isAdmin, (req, res) => {
    //moving a region to a new host

    //get region
    let regionID = new UUIDString(req.params.regionID);
    let hostAddress: string = req.body.host || '';
    let region: Region;
    let newHost: Host;

    console.log('Setting host for region ' + regionID.toString() + ' to host: ' + hostAddress);

    mgm.getRegion(regionID).then((r: Region) => {
      if (r.isRunning) {
        throw new Error('Region is currently running');
      }
      region = r;
      if (r.slaveAddress === hostAddress) {
        throw new Error('Region is already on that host');
      }
    }).then(() => {
      //get new host
      return new Promise<Host>((resolve, reject) => {
        mgm.getHost(hostAddress).then((h: Host) => {
          resolve(h);
        }).catch(() => {
          resolve(null);
        })
      });
    }).then((h: Host) => {
      newHost = h;

      //try to get region's current host
      return new Promise<Host>((resolve, reject) => {
        mgm.getHost(region.slaveAddress).then((h: Host) => {
          resolve(h);
        }).catch(() => {
          resolve(null);
        })
      });
    }).then((fromHost: Host) => {
      //if the old host does not exist, skip to the next step
      if (fromHost === null) {
        return Promise.resolve();
      }

      //try to remove the host, but we dont care if we fail
      return new Promise<void>((resolve, reject) => {
        mgm.removeRegionFromHost(region, fromHost).then(() => {
          resolve();
        }).catch(() => {
          resolve();
        });
      });
    }).then(() => {
      //we are removed from the old host
      return mgm.putRegionOnHost(region, newHost);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/stop/:uuid', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let session: AdminSession;

    let region: Region;

    mgm.getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region ' + r.name + ' is not running');
      }
      region = r;
      return RemoteAdmin.Open(r.slaveAddress, r.httpPort, conf.user, conf.pass);
    }).then((s: AdminSession) => {
      session = s;
      return RemoteAdmin.Shutdown(s, region.uuid, 0);
      // dont bother closing the session, the process is terminating
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      console.log(err);
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/kill/:uuid', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let target: Region;
    mgm.getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region ' + r.name + ' is not running');
      }
      if (r.slaveAddress === null || r.slaveAddress === '') {
        throw new Error('Region ' + r.name + ' is not assigned a host');
      }
      target = r;
      return mgm.getHost(r.slaveAddress);
    }).then((h: Host) => {
      return mgm.killRegion(target, h);
    }).catch((err) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/start/:regionID', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.regionID);
    let r: Region

    mgm.getRegion(regionID).then((region: Region) => {
      r = region;
      return mgm.getHost(r.slaveAddress);
    }).then((h: Host) => {
      return mgm.startRegion(r, h);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  router.get('/config/:uuid?', MGM.isAdmin, (req, res) => {
    let regionID = req.params.uuid;
    let p;
    if (regionID) {
      p = mgm.getRegion(new UUIDString(regionID)).then((r: Region) => {
        return mgm.getConfigs(r);
      });

    } else {
      p = mgm.getConfigs(null);
    }
    p.then((configs) => {
      res.send(JSON.stringify({ Success: true, Config: configs }));
    }).catch((err) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  return router;
}
