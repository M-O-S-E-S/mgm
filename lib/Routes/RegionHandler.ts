import { Response, RequestHandler } from 'express';
import { Store } from '../Store';
import { Config } from '../Config';
import { IRegion, IHost, IEstate, IUser } from '../types';
import { AuthenticatedRequest } from '../Auth';
import { Set } from 'immutable';
import { RegionLogs } from '../regionLogs';
import Promise = require('bluebird');
import * as formstream from 'formstream';

import { RemoveRegionFromHost, PutRegionOnHost, StopRegion, KillRegion, StartRegion } from '../Region';

export function GetRegionsHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res: Response) {
    store.Regions.getAll()
      .then((regions: IRegion[]) => {
        return regions.filter((r: IRegion) => {
          return req.user.isAdmin || req.user.regions.has(r.uuid);
        });
      }).then((regions: IRegion[]) => {
        res.json({
          Success: true,
          Regions: regions
        });
      }).catch((err: Error) => {
        res.json({
          Success: false,
          Message: err.message
        });
      });
  }
}

export function StartRegionHandler(store: Store, conf: Config): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;
    let r: IRegion

    if (!req.user.isAdmin && !req.user.regions.has(regionID))
      return res.json({ Success: false, Message: 'Permission Denied' });

    store.Regions.getByUUID(regionID.toString()).then((region: IRegion) => {
      r = region;
      return store.Hosts.getByAddress(r.node);
    }).then((h: IHost) => {
      return StartRegion(r, h, conf);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    })
  };
}


export function StopRegionHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;
    let region: IRegion

    if (!req.user.isAdmin && !req.user.regions.has(regionID))
      return res.json({ Success: false, Message: 'Permission Denied' });

    store.Regions.getByUUID(regionID.toString()).then((r: IRegion) => {
      if (!r.isRunning) {
        throw new Error('Region ' + r.name + ' is not running');
      }
      if (!r.node) {
        throw new Error('Region ' + r.name + ' is marked as running, but is not assigned to a host');
      }
      region = r;
      return store.Users.getByID(req.user.uuid);
    }).then((u: IUser) => {
      return StopRegion(region, u);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function KillRegionHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;
    let target: IRegion;

    if (!req.user.isAdmin && !req.user.regions.has(regionID))
      return res.json({ Success: false, Message: 'Permission Denied' });

    store.Regions.getByUUID(regionID.toString()).then((r: IRegion) => {
      if (!r.isRunning)
        throw new Error('Region ' + r.name + ' is not running');
      if (!r.node)
        throw new Error('Region ' + r.name + ' is marked as running, but is not assigned to a host');
      target = r;
      return store.Hosts.getByAddress(r.node);
    }).then((h: IHost) => {
      return KillRegion(target, h);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function GetRegionLogsHandler(store: Store, logger: RegionLogs): RequestHandler {
  return function (req: AuthenticatedRequest, res: Response) {
    let regionID = req.params.uuid;

    if (!req.user.isAdmin && !req.user.regions.has(regionID))
      return res.json({ Success: false, Message: 'Permission Denied' });

    store.Regions.getByUUID(regionID).then((r: IRegion) => {
      return logger.getLogs(r);
    }).then((log: string) => {
      res.json({
        Success: true,
        Message: log
      });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  }
}

export function SetRegionEstateHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;
    let estateID: number = parseInt(req.body.estate);

    let estate: IEstate;

    if (!req.user.isAdmin && !req.user.regions.has(regionID))
      return res.json({ Success: false, Message: 'Permission Denied' });

    //confirm the components exist
    store.Estates.getById(estateID).then((e: IEstate) => {
      //confirmed
      estate = e;
      return store.Regions.getByUUID(regionID.toString());
    }).then((r: IRegion) => {
      //confirmed
      return store.Estates.setEstateForRegion(estate, r);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function SetRegionCoordinatesHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;
    let x = parseInt(req.body.x);
    let y = parseInt(req.body.y);

    if (!req.user.isAdmin && !req.user.regions.has(regionID))
      return res.json({ Success: false, Message: 'Permission Denied' });

    store.Regions.getAll().then((regions: IRegion[]) => {
      let region: IRegion;
      for (let r of regions) {
        if (r.x === x && r.y === y) throw new Error('Those coordinates are not available');
        if (r.uuid === regionID) region = r;
      }
      return region;
    }).then((r: IRegion) => {
      if (r.isRunning) throw new Error('Cannot move a region while it is running');
      return store.Regions.setXY(r, x, y);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function SetRegionHostHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;
    let hostAddress: string = req.body.host || '';
    let region: IRegion;
    let newHost: IHost;

    if (!req.user.isAdmin && !req.user.regions.has(regionID))
      return res.json({ Success: false, Message: 'Permission Denied' });

    store.Regions.getByUUID(regionID.toString()).then((r: IRegion) => {
      if (r.isRunning) {
        throw new Error('Region is currently running');
      }
      region = r;
      if (r.node === hostAddress) {
        throw new Error('Region is already on that host');
      }
    }).then(() => {
      if (hostAddress)
        return store.Hosts.getByAddress(hostAddress);
      else
        return null
    }).then((h: IHost) => {
      newHost = h;

      //try to get region's current host
      if (region.node)
        return store.Hosts.getByAddress(region.node);
      else
        return null;
    }).then((fromHost: IHost) => {
      //if the old host does not exist, skip to the next step
      if (fromHost) {
        // try to remove the host, but we dont care if we fail
        // as the host may be unavailable or offline
        RemoveRegionFromHost(region, fromHost);
      }
    }).then(() => {
      //we are removed from the old host
      if (newHost)
        return PutRegionOnHost(store, region, newHost);
      else
        return Promise.resolve();
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      console.log(err);
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function CreateRegionHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let name = req.body.name;

    if (!req.body.x || isNaN(parseInt(req.body.x, 10))) return res.json({ Success: false, Message: "Integer X coordinate required" });
    if (!req.body.y || isNaN(parseInt(req.body.y, 10))) return res.json({ Success: false, Message: "Integer Y coordinate required" });
    if (!name) return res.json({ Success: false, Message: "Region name cannot be blank" });
    if (!req.body.estate || isNaN(parseInt(req.body.estate, 10))) return res.json({ Success: false, Message: "Invalid Estate Assignment" });

    let estateID = parseInt(req.body.estate, 10);
    let x = parseInt(req.body.x, 10);
    let y = parseInt(req.body.y, 10);

    if (x < 0 || y < 0)
      return res.json({ Success: false, Message: "Invalid region coordinates" });

    let newRegion: IRegion;
    let newEstate: IEstate;

    store.Estates.getById(estateID).then((e: IEstate) => {
      newEstate = e;
      return store.Regions.getAll();
    }).then((regions: IRegion[]) => {
      regions.map((r: IRegion) => {
        if (r.name === name) throw new Error('That region name is already taken');
        if (r.x === x && r.y === y) throw new Error('Those coordinates are not available');
      });
      return Promise.resolve();
    }).then(() => {
      return store.Regions.create(name, x, y);
    }).then((r: IRegion) => {
      newRegion = r;
      return store.Estates.setEstateForRegion(newEstate, r);
    }).then(() => {
      return res.json({ Success: true, Message: newRegion.uuid });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
      console.log(err);
    });
  };
}

export function DeleteRegionHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;

    store.Regions.getByUUID(regionID).then((r: IRegion) => {
      if (r.isRunning)
        throw new Error('cannot delete a running region');
      if (r.node)
        throw new Error('region is still allocated a host');
      return store.Regions.delete(r);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}