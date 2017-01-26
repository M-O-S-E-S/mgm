
import * as Sequelize from 'sequelize';
import { OfflineMessageInstance, OfflineMessageAttribute } from './mysql';

export class OfflineMessages {
  private db: Sequelize.Model<OfflineMessageInstance, OfflineMessageAttribute>

  constructor(ui: Sequelize.Model<OfflineMessageInstance, OfflineMessageAttribute>) {
    this.db = ui;
  }

  getFor(uuid: string): Promise<OfflineMessageInstance[]> {
    return this.db.findAll({
      where: {
        uuid: uuid
      }
    });
  }

  destroyFor(uuid: string): Promise<void> {
    return this.db.findAll({
      where: {
        uuid: uuid
      }
    }).then( (msgs: OfflineMessageInstance[]) => {
      return Promise.all( msgs.map( (m: OfflineMessageInstance) => {
        return m.destroy();
      }))
    }).then(() => {});
  }

  save(uuid: string, message: string): Promise<OfflineMessageInstance> {
    return this.db.create({
      uuid: uuid,
      message: message
    })
  }
}