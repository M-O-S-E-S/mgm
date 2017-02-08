
import * as Sequelize from 'sequelize';
import { HostInstance, HostAttribute } from './mysql';

export class Hosts {
  private db: Sequelize.Model<HostInstance, HostAttribute>

  constructor(ui: Sequelize.Model<HostInstance, HostAttribute>) {
    this.db = ui;
  }

  getAll(): Promise<HostInstance[]> {
    return this.db.findAll();
  }

  getByAddress(address: string): Promise<HostInstance> {
    return this.db.findAll({
      where: {
        address: address
      }
    }).then((hosts) => {
      if(hosts.length == 0){
        throw new Error('Host does not exist');
      }
      return hosts[0];
    })
  }

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
  }

}