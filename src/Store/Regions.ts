
import * as Sequelize from 'sequelize';
import { RegionInstance, RegionAttribute } from './mysql';
import { IRegion } from '../common/messages';
import { UUIDString } from '../lib';

export class Regions {
  private db: Sequelize.Model<RegionInstance, RegionAttribute>

  constructor(ui: Sequelize.Model<RegionInstance, RegionAttribute>) {
    this.db = ui;
  }

  getAll(): Promise<RegionInstance[]> {
    return this.db.findAll();
  }

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

  getByUUID(uuid: string): Promise<RegionInstance> {
    return this.db.findAll({
      where: {
        uuid: uuid
      }
    }).then((regions) => {
      if (regions.length == 0)
        throw new Error('Region DNE');
      return regions[0];
    })
  }
}