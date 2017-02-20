
import { IPool } from 'mysql';

import { IRegion } from '../Types';

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

  constructor(db: IPool) {
    this.db = db;
  }

  getAll(): Promise<IRegion[]> {
    return new Promise<IRegion[]>((resolve, reject) => {
      this.db.query('SELECT * FROM regions WHERE 1', (err: Error, rows: region_row[]) => {
        if (err) return reject(err);
        resolve(rows.map((r: region_row): IRegion => {
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
        }));
      });
    });
  }

  getByUUID(uuid: string): Promise<IRegion> {
    return new Promise<IRegion>((resolve, reject) => {
      this.db.query('SELECT * FROM regions WHERE uuid=?', uuid, (err: Error, rows: region_row[]) => {
        if (err) return reject(err);
        if (rows.length !== 1) return reject(new Error('Region ' + uuid + ' does not exist'));
        let r = rows[0];
        resolve({
          uuid: r.uuid,
          name: r.name,
          x: r.locX,
          y: r.locY,
          status: r.status,
          node: r.slaveAddress,
          publicAddress: r.externalAddress,
          port: r.httpPort,
          isRunning: r.isRunning ? true : false
        });
      });
    });
  }

  /*
  create(name: string, x: number, y: number): Promise<RegionInstance> {
    return this.db.create({
      uuid: UUIDString.random().toString(),
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
    })
  }

  getBySlave(address: string): Promise<RegionInstance[]> {
    return this.db.findAll({
      where: {
        slaveAddress: address
      }
    })
  }
  */
}