
import { IPool } from 'promise-mysql';

import { IJob } from '../Types';

interface job_row {
  id: number
  timestamp: Date
  type: string
  user: string
  data: string
}

export class Jobs {
  private db: IPool

  constructor(db: IPool) {
    this.db = db;
  }

  getFor(uuid: string): Promise<IJob[]> {
    return this.db.query('SELECT * FROM jobs WHERE user=?', [uuid]);
  }

  /*getByID(id: number): Promise<JobInstance> {
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
  }*/
}