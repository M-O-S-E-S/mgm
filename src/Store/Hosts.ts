
import { IPool } from 'promise-mysql';

import { IHost } from '../Types';

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