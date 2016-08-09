
import { UUIDString } from '../halcyon/UUID';
import { Sql } from '../mysql/sql';
import { EstateMgr, Estate } from '../halcyon/Estate';
import { Host } from './Host';

export interface Region {
  getUUID(): UUIDString
  getName(): string
  getNodeAddress(): string
  setNodeAddress(address: string): Promise<void>
  getExternalAddress(): string
  setExternalAddress(address: string): Promise<Region>
  getX(): number
  getY(): number
  setCoordinates(x: number, y: number): Promise<Region>
  getPort(): number
  setPort(port: number): Promise<Region>
  isRunning(): boolean
  setRunning(boolean): void
  getStatus(): any
  setStats(any)
  setEstate(Estate): Promise<Region>

  getConfigs(): Promise<{ [key: string]: { [key: string]: string } }>
}

class RegionObj {
  private db: Sql
  private hal: Sql
  uuid: UUIDString
  name: string
  port: number
  x: number
  y: number
  externalAddress: string
  nodeAddress: string
  running: boolean
  status: any;

  constructor(db: Sql, hal: Sql) {
    this.db = db;
    this.hal = hal;
    this.uuid = UUIDString.zero();
    this.name = '';
    this.port = 0;
    this.x = 1000;
    this.y = 1000;
    this.externalAddress = '';
    this.nodeAddress = '';
    this.running = false;
  }

  getName(): string {
    return this.name;
  }

  getUUID(): UUIDString {
    return this.uuid;
  }

  getPort(): number {
    return this.port;
  }

  setPort(port: number): Promise<Region> {
    return new Promise<Region>((resolve, reject) => {
      let args = {
        httpPort: port,
      }
      this.db.pool.query('UPDATE regions SET ? WHERE uuid=?', [args, this.uuid.toString()], (err) => {
        if (err)
          return reject(err);
        resolve();
      });
    }).then(() => {
      this.port = port;
      return this;
    });
  }

  setEstate(e: Estate): Promise<Region> {
    return new Promise<void>((resolve, reject) => {
      this.hal.pool.query('INSERT INTO estate_map (RegionID, EstateID) VALUES (?,?) ON DUPLICATE KEY UPDATE EstateID=?', [this.uuid.toString(), e.id, e.id], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      e.regions.push(this.uuid);
      return this;
     });
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getExternalAddress(): string {
    return this.externalAddress;
  }

  setExternalAddress(address: string): Promise<Region> {
    return new Promise<Region>((resolve, reject) => {
      let args = {
        externalAddress: address,
      }
      this.db.pool.query('UPDATE regions SET ? WHERE uuid=?', [args, this.uuid.toString()], (err) => {
        if (err)
          return reject(err);
        resolve();
      });
    }).then(() => {
      this.externalAddress = address;
      return this;
    });
  }

  getNodeAddress(): string {
    return this.nodeAddress;
  }

  setNodeAddress(address: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      //update region sql to point to new host
      this.db.pool.query('UPDATE regions SET slaveAddress=? WHERE uuid=?',
        [address, this.uuid.toString()], err => {
          if (err) return reject(err);
          resolve();
        });
    }).then( () => {
      this.nodeAddress = address;
    })
  }

  isRunning(): boolean {
    return this.running;
  }

  setRunning(running: boolean) {
    this.running = running;
  }

  setStats(stats: any) {
    this.status = stats;
  }

  getStatus(): any {
    return this.status;
  }

  setCoordinates(x: number, y: number): Promise<Region> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE regions SET locX=?, locY=? WHERE uuid=?', [x, y, this.uuid.toString()], err => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      this.x = x;
      this.y = y;
      return this;
    });
  }

  getConfigs(): Promise<{ [key: string]: { [key: string]: string } }> {
    return new Promise<any>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM iniConfig WHERE region=?', this.uuid.toString(), (err, rows) => {
        if (err)
          return reject(err);
        if (rows)
          return resolve(rows);
        resolve([]);
      });
    }).then((rows: any[]) => {
      let ini: { [key: string]: { [key: string]: string } } = {}
      for (let r of rows) {
        if (!ini[r.section])
          ini[r.section] = {};
        ini[r.section][r.item] = r.content;
      }
      return ini;
    });
  }
}

export class RegionMgr {
  private static _instance: RegionMgr = null;
  private db: Sql
  private hal: Sql
  private regions: { [key: string]: RegionObj } = {}

  constructor(db: Sql, hal: Sql) {
    if (RegionMgr._instance) {
      throw new Error('RegionMgr singleton has already been initialized');
    }
    this.db = db;
    this.hal = hal;
    this.initialize();

    RegionMgr._instance = this;
  }

  public static instance(): RegionMgr {
    return RegionMgr._instance;
  }

  getAllRegions(): Promise<Region[]> {
    let regions: Region[] = [];
    for (let k in this.regions) {
      regions.push(this.regions[k]);
    }
    return Promise.resolve(regions);
  }

  getRegionsOn(h: Host): Promise<Region[]> {
    let regions: Region[] = [];
    for (let r in this.regions) {
      if (this.regions[r].nodeAddress === h.getAddress()) {
        regions.push(this.regions[r]);
      }
    }
    return Promise.resolve(regions);
  }

  getRegion(id: UUIDString): Promise<Region> {
    if (id.toString() in this.regions) {
      return Promise.resolve(this.regions[id.toString()]);
    }
    return Promise.reject(new Error('Region does not exist'));
  }

  destroyRegion(r: Region): Promise<void> {
    let uuid = r.getUUID().toString();
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM regions WHERE uuid=?', uuid, (err) => {
        if (err)
          return reject(err);
        resolve();
      })
    }).then(() => {
      delete this.regions[r.getUUID().toString()];
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM allparcels WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM estate_map WHERE RegionID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM land WHERE RegionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM landaccesslist WHERE LandUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM objects WHERE regionuuid=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM parcels WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM parcelsales WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM primitems WHERE primID in (SELECT UUID FROM prims WHERE RegionUUID=?)', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM primshapes WHERE UUID in (SELECT UUID FROM prims WHERE RegionUUID=?)', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM prims WHERE RegionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM prims_copy_temps WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM regionenvironment WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM parcelsales WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM RegionRdbMapping WHERE region_id=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM regions WHERE uuid=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM regionsettings WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM telehubs WHERE RegionID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.hal.pool.query('DELETE FROM terrain WHERE RegionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  insertRegion(name: string, x: number, y: number): Promise<Region> {
    let uuid = UUIDString.random();
    return new Promise<Region>((resolve, reject) => {
      this.db.pool.query('INSERT INTO regions (uuid, name, locX, locY, status) VALUES (?,?,?,?,?)',
        [uuid.toString(), name, x, y, ''], (err) => {
          if (err) return reject(err);
          let r = new RegionObj(this.db, this.hal);
          r.uuid = uuid;
          r.name = name;
          r.x = x;
          r.y = y;
          resolve(r);
        })
    }).then((r: RegionObj) => {
      this.regions[r.uuid.toString()] = r;
      return r;
    })
  }

  private initialize() {
    return new Promise<Region[]>((resolve, reject) => {
      this.db.pool.query("SELECT * FROM regions WHERE 1", (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      for (let r of rows) {
        let reg = new RegionObj(this.db, this.hal);
        reg.uuid =new UUIDString(r.uuid);
        reg.name = r.name;
        reg.port = parseInt(r.httpPort);
        reg.x = parseInt(r.locX);
        reg.y = parseInt(r.locY);
        reg.externalAddress = r.externalAddress;
        reg.nodeAddress = r.slaveAddress;
        this.regions[reg.uuid.toString()] = reg;
      }
    });
  }
}
