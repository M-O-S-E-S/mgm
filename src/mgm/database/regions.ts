
import * as mysql from 'mysql';

import { UUIDString } from '../../halcyon/UUID';
import { Region } from '../Region';

export class regions {

  constructor(private pool: mysql.IPool) {
  }

  get(id: UUIDString): Promise<Region> {
    return new Promise<Region>((resolve, reject) => {
      this.pool.query('SELECT * FROM regions WHERE uuid=?', id.toString(), (err, rows) => {
        if (err)
          return reject(err);
        if (rows.length !== 1)
          return reject(new Error('Invalid region: ' + id.toString()));
        resolve(rows[0]);
      });
    }).then((row: any) => {
      return this.buildRegion(row);
    });
  }

  getAll(): Promise<Region[]> {
    return new Promise<Region[]>((resolve, reject) => {
      this.pool.query("SELECT * FROM regions WHERE 1", (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let regions: Region[] = [];
      for (let r of rows) {
        regions.push(this.buildRegion(r));
      }
      return regions;
    });
  }

  getOn(address: string): Promise<Region[]> {
    return new Promise<Region[]>((resolve, reject) => {
      this.pool.query('SELECT * FROM regions WHERE slaveAddress=?', address, (err, rows) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let regions: Region[] = [];
      for (let r of rows) {
        regions.push(this.buildRegion(r));
      }
      return regions;
    });
  }

  getByName(name: string): Promise<Region> {
    return new Promise<Region>((resolve, reject) => {
      this.pool.query('SELECT * FROM regions WHERE name=?', name, (err, rows) => {
        if (err)
          return reject(err);
        if (rows.length < 1)
          return reject(new Error('Region ' + name + ' does not exist'));
        resolve(rows[0]);
      });
    }).then((row: any) => {
      return this.buildRegion(row);
    });
  }

  getFor(id: UUIDString): Promise<Region[]> {
    let query = `Select name, uuid, locX, locY, size, slaveAddress, isRunning, EstateName, status from regions, estate_map, estate_settings
        where estate_map.RegionID = regions.uuid AND estate_map.EstateID = estate_settings.EstateID AND uuid in
        (SELECT RegionID FROM estate_map WHERE
        EstateID in (SELECT EstateID FROM estate_settings WHERE EstateOwner=? OR
        EstateID in (SELECT EstateID from estate_managers WHERE uuid=?)`;
    return new Promise<Region[]>((resolve, reject) => {
      this.pool.query(query, [id.toString(), id.toString()], (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let regions: Region[] = [];
      for (let r of rows) {
        regions.push(this.buildRegion(r));
      }
      return regions;
    });
  }

  update(r: Region): Promise<Region> {
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
      this.pool.query('UPDATE regions SET ? WHERE uuid=?', [args, r.uuid.toString()], (err) => {
        if (err)
          return reject(err);
        resolve(r);
      })
    });
  }

  updateStats(r: Region, isRunning: boolean, stats: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pool.query('UPDATE regions SET isRunning=?, status=? WHERE uuid=?',
        [isRunning, stats, r.uuid.toString()], (err) => {
          if (err)
            return reject(err);
          resolve();
        });
    });
  }

  setCoordinates(r: Region, x: number, y: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pool.query('UPDATE regions SET locX=?, locY=? WHERE uuid=?', [x,y,r.uuid.toString()], err => {
        if(err) return reject(err);
        resolve();
      })
    });
  }

  setHost(r: Region, address: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      //update region sql to point to new host
      this.pool.query('UPDATE regions SET slaveAddress=? WHERE uuid=?',
        [address==='' ? address : null, r.uuid.toString()], err => {
          if (err)
            return reject(err);
          resolve();
        })
    })
  }

  getConfigs(r: Region): Promise<{ [key: string]: { [key: string]: string } }> {
    return new Promise<any>((resolve, reject) => {
      if (r === null) {
        this.pool.query('SELECT * FROM iniConfig WHERE region IS NULL', (err, rows) => {
          if (err)
            return reject(err);
          resolve(rows);
        });
      } else {
        this.pool.query('SELECT * FROM iniConfig WHERE region=?', r.uuid.toString(), (err, rows) => {
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
        if (!ini[r.section])
          ini[r.section] = {};
        ini[r.section][r.item] = r.content;
      }
      return ini;
    });
  }

  insert(r: Region): Promise<Region> {
    r.uuid = UUIDString.random();
    return new Promise<Region>((resolve, reject) => {
      this.pool.query('INSERT INTO regions (uuid,name, size, locX, locY, status) VALUES (?,?,?,?,?,?)',
        [r.uuid.toString(), r.name, r.size, r.locX, r.locY, JSON.stringify(r.status || {})], (err) => {
          if (err) return reject(err);
          resolve(r);
        })
    });
  }

  delete(r: Region): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pool.query('DELETE FROM regions WHERE uuid=?', r.uuid.toString(), (err) => {
        if (err)
          return reject(err);
        resolve();
      })
    })
  }

  private buildRegion(row: any): Region {
    let r = new Region()
    r.uuid = new UUIDString(row.uuid);
    r.name = row.name;
    r.size = row.size;
    r.httpPort = row.httpPort;
    r.consolePort = row.consolePort;
    // halcyon does not use these for console connectivity
    //r.consoleUname = new UUIDString(row.consoleUname);
    //r.consolePass = new UUIDString(row.consolePass);
    r.locX = row.locX;
    r.locY = row.locY;
    r.externalAddress = row.externalAddress;
    r.slaveAddress = row.slaveAddress;
    r.isRunning = row.isRunning;
    r.status = JSON.parse(row.status);
    return r;
  }
}
