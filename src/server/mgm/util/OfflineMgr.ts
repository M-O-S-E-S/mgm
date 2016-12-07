import { Sql } from '../../mysql/sql';
import { UUIDString } from '../../halcyon/UUID';

export class OfflineMgr {
  private static _instance: OfflineMgr = null;
  private db: Sql

  constructor(sql: Sql) {
    if (OfflineMgr._instance) {
      throw new Error('RegionMgr singleton has already been initialized');
    }
    this.db = sql;

    OfflineMgr._instance = this;
  }

  public static instance(): OfflineMgr {
    return OfflineMgr._instance;
  }

  save(toAgent: UUIDString, message: string): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
      this.db.pool.query('INSERT INTO offlineMessages (uuid, message) VALUES (?,?)', [toAgent.toString(), message], (err) => {
        if(err) return reject(err);
        resolve();
      });
    });
  }

  getFor(userID: UUIDString): Promise<string[]> {
    return new Promise<string[]>( (resolve, reject) => {
      this.db.pool.query('SELECT message FROM offlineMessages WHERE uuid=?', userID.toString(), (err, rows) => {
        if(err) return reject(err);
        resolve(rows);
      })
    }).then( (rows: any) => {
      return rows.map( (r) => {return r.message;});
    });
  }

  clearFor(userID: UUIDString): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
      this.db.pool.query('DELETE FROM offlineMessages WHERE uuid=?', userID.toString(), (err) => {
        if(err) return reject(err);
        resolve();
      });
    });
  }
}
