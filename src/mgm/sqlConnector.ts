import * as mysql from 'mysql';
import {Sql} from '../mysql/sql';
import * as Promise from 'bluebird';
import { UUIDString } from '../halcyon/UUID';
import { Host } from './host';
import { Job } from './Job';
import { Region } from './Region';

import { Config } from './MGM';

export class SqlConnector {
  db: Sql

  constructor(conf: Config) {
    this.db = new Sql(conf.mgm);
  }

  getHost(ip: string): Promise<Host> {
    return new Promise<Host>((resolve, reject) => {
      this.db.pool.query("SELECT * FROM hosts WHERE address=?", ip, (err, rows: any[]) => {
        if (err)
          reject(err);
        if (!rows || rows.length !== 1) {
          reject(new Error('Invalid Host'));
        } else {
          resolve(rows[0]);
        }
      });
    });
  }

  deleteHost(address: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM hosts WHERE address=?', address, (err) => {
        if (err)
          return reject(err);
        resolve();
      });
    }).then(() => {
      this.db.pool.query('UPDATE regions SET isRunning=? and slaveAddress=? WHERE slaveAddress=?',
        [false, '', address], (err) => {
          if (err)
            throw err;
        });
    })
  }

  insertRegion(r: Region): Promise<Region> {
    r.uuid = UUIDString.random();
    return new Promise<Region>((resolve, reject) => {
      this.db.pool.query('INSERT INTO regions (uuid,name, size, locX, locY, status) VALUES (?,?,?,?,?,?)',
        [r.uuid.toString(), r.name, r.size, r.locX, r.locY, JSON.stringify(r.status)], (err) => {
          if (err) return reject(err);
          resolve(r);
        })
    });
  }

  insertHost(address: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('INSERT INTO hosts (address, cmd_key, status) VALUES (?, ?, ?)',
        [address, UUIDString.zero(), "{}"], (err) => {
          if (err)
            return reject(err);
          resolve();
        })
    });
  }

  updateHost(h: Host): Promise<Host> {
    return new Promise<Host>((resolve, reject) => {
      this.db.pool.query('UPDATE hosts SET port=?, name=?, cmd_key=?, slots=? WHERE address=?',
        [h.port, h.name, h.cmd_key, h.slots, h.address], (err) => {
          if (err)
            return reject(err);
          resolve(h);
        })
    });
  }


  updateHostStats(h: Host, stats: string): Promise<Host> {
    return new Promise<Host>((resolve, reject) => {
      this.db.pool.query('UPDATE hosts SET status=? WHERE address=?', [stats, h.address], (err) => {
        if (err)
          return reject(err);
        resolve(h);
      })
    });
  }

  getJobsFor(id: UUIDString): Promise<Job[]> {
    return new Promise<Job[]>((resolve, reject) => {
      this.db.pool.query("SELECT * FROM jobs WHERE user=?", id.toString(), (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  getAllRegions(): Promise<Region[]> {
    return new Promise<Region[]>((resolve, reject) => {
      this.db.pool.query("SELECT * FROM regions WHERE 1", (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  getHosts(): Promise<Host[]> {
    return new Promise<Host[]>((resolve, reject) => {
      this.db.pool.query('SELECT address, name, status, slots FROM hosts WHERE 1', (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  getRegionsOn(h: Host): Promise<Region[]> {
    return new Promise<Region[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM regions WHERE slaveAddress=?', h.address, (err, rows) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  updateRegionStats(r: Region, isRunning: boolean, stats: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE regions SET isRunning=?, status=? WHERE uuid=?',
        [isRunning, stats, r.uuid.toString()], (err) => {
          if (err)
            return reject(err);
          resolve();
        });
    });
  }

  getRegionByName(name: string): Promise<Region> {
    return new Promise<Region>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM regions WHERE name=?', name, (err, rows) => {
        if (err)
          return reject(err);
        if (rows.length < 1)
          return reject(new Error('Region ' + name + ' does not exist'));
        resolve(rows[0]);
      });
    });
  }

  updateRegion(r: Region): Promise<Region> {
    return new Promise<Region>((resolve, reject) => {
      r.consoleUname = UUIDString.random();
      r.consolePass = UUIDString.random();
      let args = {
        httpPort: r.httpPort,
        consolePort: r.consolePort,
        externalAddress: r.externalAddress,
        consoleUname: r.consoleUname.toString(),
        consolePass: r.consolePass.toString()
      }
      this.db.pool.query('UPDATE regions SET ? WHERE uuid=?', [args, r.uuid.toString()], (err) => {
        if (err)
          return reject(err);
        resolve(r);
      })
    });
  }

  getRegion(id: UUIDString): Promise<Region> {
    return new Promise<Region>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM regions WHERE uuid=?', id.toString(), (err, rows) => {
        if (err)
          return reject(err);
        if (rows.length !== 1)
          return reject(new Error('Invalid region: ' + id.toString()));
        resolve(rows[0]);
      });
    });
  }

  getRegionsFor(id: UUIDString): Promise<Region[]> {
    let query = `Select name, uuid, locX, locY, size, slaveAddress, isRunning, EstateName, status from regions, estate_map, estate_settings
        where estate_map.RegionID = regions.uuid AND estate_map.EstateID = estate_settings.EstateID AND uuid in
        (SELECT RegionID FROM estate_map WHERE
        EstateID in (SELECT EstateID FROM estate_settings WHERE EstateOwner=? OR
        EstateID in (SELECT EstateID from estate_managers WHERE uuid=?)`;
    return new Promise<Region[]>((resolve, reject) => {
      this.db.pool.query(query, [id.toString(), id.toString()], (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  setHostForRegion(r: Region, h: Host): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      //update region sql to point to new host
      this.db.pool.query('UPDATE regions SET slaveAddress=? WHERE uuid=?',
        [h ? h.address : null, r.uuid.toString()], err => {
          if (err)
            return reject(err);
          resolve();
        })
    })
  }

  getConfigs(r: Region): Promise<{ [key: string]: { [key: string]: string } }> {
    return new Promise<any>((resolve, reject) => {
      if (r === null) {
        this.db.pool.query('SELECT * FROM iniConfig WHERE region IS NULL', (err, rows) => {
          if (err)
            return reject(err);
          resolve(rows);
        });
      } else {
        this.db.pool.query('SELECT * FROM iniConfig WHERE region=?', r.uuid.toString(), (err, rows) => {
          if (err)
            return reject(err);
          if (rows)
            return resolve(rows);
          resolve([]);
        });
      }
    }).then((rows: any[]) => {
      let ini: { [key: string]: { [key: string]: string } } = {}
      for (let r of rows) {
        if( ! ini[r.section] )
          ini[r.section] = {};
        ini[r.section][r.item] = r.content;
      }
      return ini;
    });
  }

  destroyRegion(r: Region): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
      this.db.pool.query('DELETE FROM regions WHERE uuid=?', r.uuid.toString(), (err) => {
        if(err)
          return reject(err);
        resolve();
      })
    })
  }
}
