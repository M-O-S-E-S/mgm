
import { IPool } from 'promise-mysql';
import Promise = require('bluebird');

import { IHost } from '../types';

interface hosts_row {
  id?: number
  address: string
  port: number
  name: string
  slots: number
}

export class Hosts {
  private db: IPool

  constructor(db: IPool) {
    this.db = db;
  }

  getAll(): Promise<IHost[]> {
    return this.db.query('SELECT * FROM hosts WHERE 1');
  }

  getByAddress(address: string): Promise<IHost> {
    return this.db.query('SELECT * FROM hosts WHERE address=?', [address]).then((rows: hosts_row[]) => {
      if (rows.length == 0)
        throw new Error('Host ' + address + ' does not exist');
      return rows[0];
    });
  }

  create(address: string): Promise<IHost> {
    let host: hosts_row = {
      address: address,
      port: 0,
      name: '',
      slots: 0
    }
    return this.db.query('INSERT INTO hosts SET ?', host).then((result) => {
      host.id = result.insertId;
      return host;
    });
  }

  destroy(id: number): Promise<void> {
    return this.db.query('DELETE FROM hosts WHERE id=?', id);
  }

  updateHost(host: IHost, reg: {
    slots: string      
    public_ip: string
    name: string
    port: string
  }): Promise<IHost> {
    return this.db.query('UPDATE hosts SET ? WHERE id=?', [reg, host.id]).then( () => {
      host.name = reg.name;
      host.port = parseInt(reg.port);
      host.public_ip = reg.public_ip;
      host.slots = reg.slots;
    })
  }
}
