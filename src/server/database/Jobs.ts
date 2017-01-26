
import * as Sequelize from 'sequelize';
import { JobInstance, JobAttribute } from './mysql';

export class Jobs {
  private db: Sequelize.Model<JobInstance, JobAttribute>

  constructor(ui: Sequelize.Model<JobInstance, JobAttribute>) {
    this.db = ui;
  }

  getFor(uuid: string): Promise<JobInstance[]> {
    return this.db.findAll({
      where: {
        user: uuid
      }
    });
  }

  getByID(id: number): Promise<JobInstance> {
    return this.db.findOne({
      where: {
        id: id
      }
    });
  }

  create(type: string, user: string, data: string): Promise<JobInstance> {
    return this.db.create({
      type: type,
      user: user,
      timestamp: new Date().toISOString(),
      data: data
    });
  }
}