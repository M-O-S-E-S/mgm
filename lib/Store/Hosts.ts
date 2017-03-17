
import { IPool } from 'promise-mysql';
import Promise = require('bluebird');

import { IHost } from '../types';

interface hosts_row {
  id?: number
  address: string
  port: number
  name: string
  slots: number
  status: string
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

  setStatus(host: IHost, status: string): Promise<IHost> {
    return this.db.query('UPDATE hosts SET status=? WHERE id=?', [status, host.id]).then(() => {
      host.status = status;
      return host;
    });
  }

  create(address: string): Promise<IHost> {
    let host: hosts_row = {
      address: address,
      port: 0,
      name: '',
      slots: 0,
      status: ''
    }
    return this.db.query('INSERT INTO hosts SET ?', host).then((result) => {
      host.id = result.insertId;
      return host;
    });
  }

  destroy(id: number): Promise<void> {
    return this.db.query('DELETE FROM hosts WHERE id=?', id);
  }
}