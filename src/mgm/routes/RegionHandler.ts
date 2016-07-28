
import * as express from 'express';

import { Region, RegionMgr } from '../Region';
import { Host, HostMgr } from '../Host';
import { Estate, EstateMgr } from '../../halcyon/Estate';
import { UUIDString } from '../../halcyon/UUID';
import { MGM } from '../MGM';
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

export function RegionHandler(mgm: MGM): express.Router {
  let router = express.Router();

  router.get('/', MGM.isUser, (req, res) => {
    let regions: Region[];
    let w;
    if (req.cookies['userLevel'] >= 250) {
      w = RegionMgr.instance().getAllRegions();
    } else {
      w = RegionMgr.instance().getRegionsFor(new UUIDString(req.cookies['uuid']));
    }
    w.then((rs: Region[]) => {
      regions = rs;
      return EstateMgr.instance().getAllEstates();
    }).then((estates: Estate[]) => {
      let result = [];
      for (let r of regions) {
        let estateName: string = '';
        for (let e of estates) {
          for (let reg of e.regions) {
            if (reg.toString() === r.getUUID().toString()) {
              estateName = e.name;
            }
          }
        }
        //r.status['simStats'] = { 'Uptime': r.status.uptime };
        result.push({
          uuid: r.getUUID().toString(),
          name: r.getName(),
          x: r.getX(),
          y: r.getY(),
          estateName: estateName,
          status: r.getStatus(),
          node: r.getNodeAddress() ? r.getNodeAddress() : '',
          isRunning: r.isRunning(),
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

    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      res.sendFile(RegionLogs.instance().getFilePath(r.getUUID()))
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/destroy/:uuid', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let region: Region;

    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (r.isRunning) {
        return res.send(JSON.stringify({ Success: false, Message: 'cannot delete a running region' }));
      }
      if (r.getNodeAddress() !== null) {
        return res.send(JSON.stringify({ Success: false, Message: 'region is still allocated a host' }));
      }
      region = r;
    }).then(() => {
      return RegionMgr.instance().destroyRegion(region);
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

    EstateMgr.instance().getEstate(estateID).then((e: Estate) => {
      estate = e;
      return RegionMgr.instance().getRegion(regionID);
    }).then((r: Region) => {
      return r.setEstate(estate);
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

    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (r.isRunning) throw new Error('Cannot move a region while it is running');
      if (r.getX() === x && r.getY() === y) throw new Error('Region is already at those coordinates');
      region = r;
      return RegionMgr.instance().getAllRegions();
    }).then((regions: Region[]) => {
      for (let r of regions) {
        if (r.getUUID() === region.getUUID()) {
          continue;
        }
        if (r.getX() === x && r.getY() === y) throw new Error('Region ' + r.getName() + ' is already at those coordinates');
      }
    }).then(() => {
      return region.setCoordinates(x,y);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/create', MGM.isAdmin, (req, res) => {
    let estateID = req.body.estate;
    let estate: Estate;

    EstateMgr.instance().getEstate(estateID).then((e: Estate) => {
      estate = e;
      return RegionMgr.instance().insertRegion(req.body.name, req.body.x, req.body.y);
    }).then((r: Region) => {
      return r.setEstate(estate);
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

    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (r.isRunning()) {
        throw new Error('Region is currently running');
      }
      region = r;
      if (r.getNodeAddress() === hostAddress) {
        throw new Error('Region is already on that host');
      }
    }).then(() => {
      //get new host
      return new Promise<Host>((resolve, reject) => {
        HostMgr.instance().get(hostAddress).then((h: Host) => {
          resolve(h);
        }).catch(() => {
          resolve(null);
        })
      });
    }).then((h: Host) => {
      newHost = h;

      //try to get region's current host
      return new Promise<Host>((resolve, reject) => {
        HostMgr.instance().get(region.getNodeAddress()).then((h: Host) => {
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
    let target: Region;
    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region ' + r.getName() + ' is not running');
      }
      if (r.getNodeAddress() === null || r.getNodeAddress() === '') {
        throw new Error('Region ' + r.getName() + ' is not assigned a host');
      }
      target = r;
      return HostMgr.instance().get(r.getNodeAddress());
    }).then((h: Host) => {
      return mgm.stopRegion(target, h);
    }).catch((err) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/kill/:uuid', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let target: Region;
    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region ' + r.getName() + ' is not running');
      }
      if (r.getNodeAddress() === null || r.getNodeAddress() === '') {
        throw new Error('Region ' + r.getName() + ' is not assigned a host');
      }
      target = r;
      return HostMgr.instance().get(r.getNodeAddress());
    }).then((h: Host) => {
      return mgm.killRegion(target, h);
    }).catch((err) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/start/:regionID', MGM.isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.regionID);
    let r: Region

    RegionMgr.instance().getRegion(regionID).then((region: Region) => {
      r = region;
      return HostMgr.instance().get(r.getNodeAddress());
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
      p = RegionMgr.instance().getRegion(new UUIDString(regionID)).then((r: Region) => {
        return r.getConfigs();
      });

    } else {
      p = Promise.resolve({});
    }
    p.then((configs) => {
      res.send(JSON.stringify({ Success: true, Config: configs }));
    }).catch((err) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  return router;
}
