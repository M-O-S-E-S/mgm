
import * as mysql from 'mysql';

import { UUIDString } from '../../halcyon/UUID';
import { Job } from '../Job';

export class jobs {

  constructor(private pool: mysql.IPool) {
  }

  delete(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pool.query('DELETE FROM jobs WHERE id=?', id, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  update(j: Job): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.pool.query('UPDATE jobs SET data=? WHERE id=?',
        [j.data, j.id],
        (err) => {
          if (err) return reject(err);
          resolve(j);
        })
    });
  }

  get(id: number): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.pool.query("SELECT * FROM jobs WHERE id=?", id, (err, rows: any[]) => {
        if (err) return reject(err);
        if(rows.length === 0)
          return reject(new Error('Task does not exist'));
        resolve(rows[0]);
      });
    }).then( (row: any) => {
      return this.buildJob(row);
    })
  }

  getFor(id: UUIDString): Promise<Job[]> {
    return new Promise<Job[]>((resolve, reject) => {
      this.pool.query("SELECT * FROM jobs WHERE user=?", id.toString(), (err, rows: any[]) => {
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
    return new Promise<Job>( (resolve, reject) => {
      this.pool.query('INSERT INTO jobs (type, user, data) VALUES (?,?,?)',
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
