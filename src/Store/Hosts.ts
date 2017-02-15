
import { IPool } from 'mysql';

export interface Host {
  id: number
  address: string
  name: string
  slots: number
  status: string
}

interface hosts_row {
  id: number
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

  getAll(): Promise<Host[]> {
    return new Promise<Host[]>((resolve, reject) => {
      this.db.query('SELECT * FROM hosts WHERE 1', (err: Error, rows: hosts_row[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  getByAddress(address: string): Promise<Host> {
    return new Promise<Host>((resolve, reject) => {
      this.db.query('SELECT * FROM hosts WHERE address=?', [address], (err: Error, rows: hosts_row[]) => {
        if (err)
          return reject(err);
        if (rows.length == 0)
          return reject(new Error('Host ' + address + ' does not exist'));
        resolve(rows[0]);
      });
    });
  }

  /*
  create(address: string): Promise<HostInstance> {
    return this.db.create({
      address: address,
      status: ''
    })
  }

  destroy(id: number): Promise<number> {
    return this.db.destroy({
      where: {
        id: id
      }
    })
  }*/

}