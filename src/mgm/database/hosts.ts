
import * as mysql from 'mysql';

import { UUIDString } from '../../halcyon/UUID';
import { Host } from '../Host';

export class hosts {

  constructor(private pool: mysql.IPool) {
  }

  get(ip: string): Promise<Host> {
    return new Promise<Host>((resolve, reject) => {
      this.pool.query("SELECT * FROM hosts WHERE address=?", ip, (err, rows: any[]) => {
        if (err)
          reject(err);
        if (!rows || rows.length !== 1) {
          reject(new Error('Invalid Host'));
        } else {
          resolve(rows[0]);
        }
      });
    }).then((row) => {
      return this.buildHost(row);
    });
  }

  getAll(): Promise<Host[]> {
    return new Promise<Host[]>((resolve, reject) => {
      this.pool.query('SELECT address, name, status, slots FROM hosts WHERE 1', (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let hosts: Host[] = [];
      for (let r of rows) {
        hosts.push(this.buildHost(r));
      }
      return hosts;
    });
  }

  update(h: Host): Promise<Host> {
    return new Promise<Host>((resolve, reject) => {
      this.pool.query('UPDATE hosts SET port=?, name=?, slots=? WHERE address=?',
        [h.port, h.name, h.slots, h.address], (err) => {
          if (err)
            return reject(err);
          resolve(h);
        })
    });
  }

  updateStats(h: Host, stats: string): Promise<Host> {
    return new Promise<Host>((resolve, reject) => {
      this.pool.query('UPDATE hosts SET status=? WHERE address=?', [stats, h.address], (err) => {
        if (err)
          return reject(err);
        resolve(h);
      })
    });
  }

  insert(address: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pool.query('INSERT INTO hosts (address, status) VALUES (?, ?)',
        [address, "{}"], (err) => {
          if (err)
            return reject(err);
          resolve();
        })
    });
  }

  delete(address: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pool.query('DELETE FROM hosts WHERE address=?', address, (err) => {
        if (err)
          return reject(err);
        resolve();
      });
    }).then(() => {
      this.pool.query('UPDATE regions SET isRunning=? and slaveAddress=? WHERE slaveAddress=?',
        [false, '', address], (err) => {
          if (err)
            throw err;
        });
    })
  }

  private buildHost(row: any): Host {
    let h = new Host;
    h.address = row.address;
    h.port = row.port;
    h.name = row.name;
    //h.cmd_key = new UUIDString(rows[0].cmd_key);
    h.slots = row.slots;
    h.status = JSON.parse(row.status);
    return h;
  }
}
