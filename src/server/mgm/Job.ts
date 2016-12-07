
import { UUIDString } from '../halcyon/UUID';
import { Sql } from '../mysql/sql';

export interface Job {
  id: number
  timestamp: string
  type: string
  user: UUIDString
  data: string
}

export class JobMgr {
  private static _instance: JobMgr = null;
  private db: Sql

  constructor(db: Sql) {
    if (JobMgr._instance) {
      throw new Error('RegionMgr singleton has already been initialized');
    }
    this.db = db;

    JobMgr._instance = this;
  }

  public static instance(): JobMgr {
    return JobMgr._instance;
  }
  delete(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM jobs WHERE id=?', id, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  update(j: Job): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.db.pool.query('UPDATE jobs SET data=? WHERE id=?',
        [j.data, j.id],
        (err) => {
          if (err) return reject(err);
          resolve(j);
        })
    });
  }

  get(id: number): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.db.pool.query("SELECT * FROM jobs WHERE id=?", id, (err, rows: any[]) => {
        if (err) return reject(err);
        if (rows.length === 0)
          return reject(new Error('Task does not exist'));
        resolve(rows[0]);
      });
    }).then((row: any) => {
      return this.buildJob(row);
    })
  }

  getFor(id: UUIDString): Promise<Job[]> {
    return new Promise<Job[]>((resolve, reject) => {
      this.db.pool.query("SELECT * FROM jobs WHERE user=?", id.toString(), (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let jobs: Job[] = [];
      for (let r of rows) {
        jobs.push(this.buildJob(r));
      }
      return jobs;
    });
  }

  insert(j: Job): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.db.pool.query('INSERT INTO jobs (type, user, data) VALUES (?,?,?)',
        [j.type, j.user.toString(), j.data],
        (err, rows) => {
          if (err)
            return reject(err);
          j.id = parseInt(rows.insertId);
          resolve(j);
        });
    });
  }

  private buildJob(row: any): Job {
    let j: Job = {
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      user: new UUIDString(row.user),
      data: row.data
    }
    return j;
  }

}
