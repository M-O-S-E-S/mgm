
import * as express from 'express';

import { PersistanceLayer, RegionInstance, HostInstance, EstateInstance, EstateMapInstance } from '../database';

import { IRegion } from '../../common/messages';
import { UUIDString } from '../util/UUID';
import { RegionLogs } from '../util/regionLogs';
import { RemoveRegionFromHost, PutRegionOnHost, StopRegion, KillRegion, StartRegion, RegionINI } from '../util/Region';

export interface ConsoleSettings {
  user: string,
  pass: string
}

import { isUser, isAdmin } from '.';

export function RegionHandler(db: PersistanceLayer): express.Router {
  let router = express.Router();

  router.get('/', isUser, (req, res) => {
    let user = new UUIDString(req.cookies['uuid']);

    // just send them all and let the client sort them.  They cant control them anyways,
    // and they can see them in-world anyways.  no need to be secret
    db.Regions.getAll().then( (regions: RegionInstance[]) => {
      res.send(JSON.stringify({
        Success: true,
        Regions: regions.map( (r: RegionInstance) => {
          let ir: IRegion = {
            uuid: r.uuid,
            name: r.name,
            x: r.locX,
            y: r.locY,
            status: r.status,
            node: r.slaveAddress,
            isRunning: r.isRunning
          }
          return ir;
        })
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.get('/logs/:uuid', isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);

    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      res.sendFile(RegionLogs.instance().getFilePath(new UUIDString(r.uuid)));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/destroy/:uuid', isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);

    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (r.isRunning) {
        return res.send(JSON.stringify({ Success: false, Message: 'cannot delete a running region' }));
      }
      if (r.slaveAddress !== null && r.slaveAddress !== '') {
        return res.send(JSON.stringify({ Success: false, Message: 'region is still allocated a host' }));
      }
      return r.destroy();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/estate/:uuid', isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let estateID: number = parseInt(req.body.estate);

    //confirm the components exist
    db.Estates.getEstateByID(estateID).then(() => {
      //confirmed
      return db.Regions.getByUUID(regionID.toString());
    }).then(() => {
      //confirmed
      return db.Estates.getMapForRegion(regionID.toString());
    }).then((r: EstateMapInstance) => {
      return r.destroy();
    }).then( () => {
      return db.Estates.setMapForRegion(estateID, regionID.toString());
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/setXY/:uuid', isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let x = parseInt(req.body.x);
    let y = parseInt(req.body.y);

    db.Regions.getAll().then( (regions: RegionInstance[]) => {
      let region: RegionInstance;
      for(let r of regions){
        if(r.locX === x && r.locY === y) throw new Error('Those coordinates are not available');
        if(r.uuid === regionID.toString()) region = r; 
      }
      return region;
    }).then((r: RegionInstance) => {
      if (r.isRunning) throw new Error('Cannot move a region while it is running');
      r.locX = x;
      r.locY = y;
      return r.save();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/create', isAdmin, (req, res) => {
    let estateID = parseInt(req.body.estate);
    let name = req.body.name;
    let x = parseInt(req.body.x);
    let y = parseInt(req.body.y);

    // confirm estate exists
    db.Estates.getEstateByID(estateID).then((e: EstateInstance) => {
      //confirmed. check for region name and location
      return db.Regions.getAll();
    }).then( (regions: RegionInstance[]) => {
      for(let r of regions){
        if(r.name === name) throw new Error('That region name is already taken');
        if(r.locX === x && r.locY === y) throw new Error('Those corrdinates are not available');
      }
    }).then( () => {
      return db.Regions.create(name, x, y);
    }).then((r: RegionInstance) => {
      return db.Estates.setMapForRegion(estateID, r.uuid);
    }).then(() => {
      return res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
      console.log(err);
    });
  });

  router.post('/host/:regionID', isAdmin, (req, res) => {
    //moving a region to a new host

    //get region
    let regionID = new UUIDString(req.params.regionID);
    let hostAddress: string = req.body.host || '';
    let region: RegionInstance;
    let newHost: HostInstance;

    console.log('Setting host for region ' + regionID.toString() + ' to host: ' + hostAddress);

    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (r.isRunning) {
        throw new Error('Region is currently running');
      }
      region = r;
      if (r.slaveAddress === hostAddress) {
        throw new Error('Region is already on that host');
      }
    }).then(() => {
      //get new host
      return new Promise<HostInstance>((resolve, reject) => {
        db.Hosts.getByAddress(hostAddress).then((h: HostInstance) => {
          resolve(h);
        }).catch(() => {
          resolve(null);
        })
      });
    }).then((h: HostInstance) => {
      newHost = h;

      //try to get region's current host
      return new Promise<HostInstance>((resolve, reject) => {
        db.Hosts.getByAddress(region.slaveAddress).then((h: HostInstance) => {
          resolve(h);
        }).catch(() => {
          resolve(null);
        })
      });
    }).then((fromHost: HostInstance) => {
      //if the old host does not exist, skip to the next step
      if (fromHost === null) {
        return Promise.resolve();
      }

      //try to remove the host, but we dont care if we fail
      return new Promise<void>((resolve, reject) => {
        RemoveRegionFromHost(region, fromHost).then(() => {
          resolve();
        }).catch(() => {
          resolve();
        });
      });
    }).then(() => {
      //we are removed from the old host
      return PutRegionOnHost(region, newHost);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/stop/:uuid', isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let target: RegionInstance;
    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (!r.isRunning) {
        throw new Error('Region ' + r.name + ' is not running');
      }
      if (r.slaveAddress === null || r.slaveAddress === '') {
        throw new Error('Region ' + r.name + ' is marked as running, but is not assigned to a host');
      }
      target = r;
      return db.Hosts.getByAddress(r.slaveAddress);
    }).then( (h: HostInstance) => {
      return StopRegion(target, h);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/kill/:uuid', isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let target: RegionInstance;
    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (!r.isRunning)
        throw new Error('Region ' + r.name + ' is not running');
      if (r.slaveAddress === null || r.slaveAddress === '')
        throw new Error('Region ' + r.name + ' is marked as running, but is not assigned to a host');
      target = r;
      return db.Hosts.getByAddress(r.slaveAddress);
    }).then((h: HostInstance) => {
      return KillRegion(target, h);
    }).catch((err) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/start/:regionID', isAdmin, (req, res) => {
    let regionID = new UUIDString(req.params.regionID);
    let r: RegionInstance

    db.Regions.getByUUID(regionID.toString()).then((region: RegionInstance) => {
      if (r.isRunning)
        throw new Error('Region ' + r.name + ' is already running');
      r = region;
      return db.Hosts.getByAddress(r.slaveAddress);
    }).then((h: HostInstance) => {
      return StartRegion(r, h);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    })
  });

  router.get('/config/:uuid?', isAdmin, (req, res) => {
    /*let regionID = req.params.uuid;
    db.Regions.getByUUID(regionID.toString()).then( (r: RegionInstance) => {
      let confs = RegionINI()
    })
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
    })*/
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  return router;
}
