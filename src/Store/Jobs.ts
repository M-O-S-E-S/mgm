
import { IPool } from 'promise-mysql';

import { IJob, IUser } from '../Types';

interface job_row {
  id?: number
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

  create(type: string, user: IUser, data: string): Promise<IJob> {
    let job: job_row = {
      timestamp: new Date(),
      type: type,
      user: user.UUID,
      data: data
    }
    return this.db.query('INSERT INTO jobs SET ?', job).then((result) => {
      job.id = result.insertId;
      return job;
    });
  }

  getByID(id: number): Promise<IJob> {
    return this.db.query('SELECT * FROM jobs WHERE id=?', id).then((rows: job_row[]) => {
      if (rows.length !== 1)
        throw new Error('Job ' + id + ' does not exist');
      return rows[0];
    });
  }

  destroy(j: IJob): Promise<void> {
    return this.db.query('DELETE FROM jobs WHERE id=?', j.id);
  }

  setData(j: IJob, data: string): Promise<IJob> {
    return this.db.query('UPDATE jobs SET data=? WHERE id=?', [data, j.id])
  }
}