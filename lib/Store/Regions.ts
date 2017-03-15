import Promise = require('bluebird');
import { IPool } from 'promise-mysql';

import { IRegion, IHost } from '../types';
import { UUID } from '../UUID';

interface region_row {
  uuid: string
  name: string
  size: number
  httpPort: number
  consolePort: number
  consoleUname: string
  consolePass: string
  locX: number
  locY: number
  externalAddress: string
  slaveAddress: string
  isRunning: boolean
  status: string
}

export class Regions {
  private db: IPool
  private simDB: IPool

  constructor(db: IPool, simDB: IPool) {
    this.db = db;
    this.simDB = simDB;
  }

  getAll(): Promise<IRegion[]> {
    return this.db.query('SELECT * FROM regions WHERE 1').then((rows: region_row[]) => {
      return rows.map((r: region_row): IRegion => {
        return {
          uuid: r.uuid,
          name: r.name,
          x: r.locX,
          y: r.locY,
          status: r.status,
          node: r.slaveAddress,
          publicAddress: r.externalAddress,
          port: r.httpPort,
          isRunning: r.isRunning ? true : false
        }
      });
    });
  }

  getByUUID(uuid: string): Promise<IRegion> {
    return this.db.query('SELECT * FROM regions WHERE uuid=?', uuid).then((rows: region_row[]) => {
      if (rows.length !== 1)
        throw new Error('Region ' + uuid + ' does not exist');
      let r = rows[0];
      return {
        uuid: r.uuid,
        name: r.name,
        x: r.locX,
        y: r.locY,
        status: r.status,
        node: r.slaveAddress,
        publicAddress: r.externalAddress,
        port: r.httpPort,
        isRunning: r.isRunning ? true : false
      };
    });
  }

  setStatus(region: IRegion, isRunning: boolean, status: string): Promise<IRegion> {
    return this.db.query('UPDATE regions SET status=?, isRunning=?  WHERE uuid=?', [status, isRunning, region.uuid]).then(() => {
      region.isRunning = isRunning;
      region.status = status;
      return region;
    });
  }

  setPortAndAddress(region: IRegion, port: number, address: string): Promise<IRegion> {
    return this.db.query('UPDATE regions SET externalAddress=?, httpPort=? WHERE uuid=?', [address, port, region.uuid]).then(() => {
      region.publicAddress = address;
      region.port = port;
      return region;
    });
  }

  setHost(region: IRegion, host: IHost): Promise<IRegion> {
    let address: string = host ? host.address : '';
    return this.db.query('UPDATE regions SET slaveAddress=? WHERE uuid=?', [address, region.uuid]).then(() => {
      region.node = address;
      return region;
    });
  }

  setXY(region: IRegion, x: number, y: number): Promise<IRegion> {
    return this.db.query('UPDATE regions SET locX=?, locY=? WHERE uuid=?', [x, y, region.uuid]).then(() => {
      region.x = x;
      region.y = y;
      return region;
    });
  }

  getByNode(host: IHost): Promise<IRegion[]> {
    return this.db.query('SELECT * FROM regions WHERE slaveAddress=?', host.address).then((rows: region_row[]) => {
      return rows.map((r: region_row): IRegion => {
        return {
          uuid: r.uuid,
          name: r.name,
          x: r.locX,
          y: r.locY,
          status: r.status,
          node: r.slaveAddress,
          publicAddress: r.externalAddress,
          port: r.httpPort,
          isRunning: r.isRunning ? true : false
        }
      });
    });
  }

  create(name: string, x: number, y: number): Promise<IRegion> {
    let r: region_row = {
      uuid: UUID.random().toString(),
      name: name,
      locX: x,
      locY: y,
      size: 1,
      httpPort: 0,
      consolePort: 0,
      consoleUname: '',
      consolePass: '',
      externalAddress: '',
      slaveAddress: '',
      isRunning: false,
      status: ''
    }
    return this.db.query('INSERT INTO regions SET ?', r).then(() => {
      return {
        uuid: r.uuid,
        name: r.name,
        x: r.locX,
        y: r.locY,
        status: r.status,
        node: r.slaveAddress,
        publicAddress: r.externalAddress,
        port: r.httpPort,
        isRunning: r.isRunning ? true : false
      };
    });
  }

  delete(r: IRegion): Promise<void> {
    if (r.isRunning || r.node)
      return Promise.reject('Refusing to delete region that is running or has a host assignment');
    return Promise.all([
      this.db.query('DELETE FROM regions WHERE uuid=?', r.uuid),
      this.simDB.query('DELETE FROM regionsettings WHERE regionUUID=?', r.uuid),
      this.simDB.query('DELETE FROM regionenvironment WHERE regionUUID=?', r.uuid),
      this.simDB.query('DELETE FROM telehubs WHERE RegionID=?', r.uuid),
      this.simDB.query('DELETE FROM terrain WHERE RegionUUID=?', r.uuid),
      this.simDB.query('DELETE FROM allparcels WHERE regionUUID=?', r.uuid),
      this.simDB.query('DELETE FROM estate_map WHERE RegionID=?', r.uuid),
      this.simDB.query('DELETE FROM landaccesslist WHERE LandUUID IN (SELECT UUID FROM land WHERE RegionUUID=?)', r.uuid).then(() => {
        return this.simDB.query('DELETE FROM land WHERE RegionUUID=?', r.uuid);
      }),
      this.simDB.query('DELETE FROM objects WHERE regionuuid=?', r.uuid),
      this.simDB.query('DELETE FROM parcels WHERE regionUUID=?', r.uuid),
      this.simDB.query('DELETE FROM parcelsales WHERE regionUUID=?', r.uuid),
      this.simDB.query('DELETE FROM regionsettings WHERE regionUUID=?', r.uuid),
      this.simDB.query('DELETE FROM primitems WHERE primID IN (SELECT UUID FROM prims WHERE RegionUUID=?)', r.uuid).then(() => {
        return this.simDB.query('DELETE FROM primshapes WHERE UUID IN (SELECT UUID FROM prims WHERE RegionUUID=?)', r.uuid);
      }).then(() => {
        this.simDB.query('DELETE FROM prims WHERE RegionUUID=?', r.uuid);
      }),
      this.simDB.query('DELETE FROM prims_copy_temps WHERE RegionUUID=?', r.uuid),
    ]).then(() => { });
  }
}