
import * as mysql from 'mysql';

import { UUIDString } from '../../halcyon/UUID';

export class messages {

  constructor(private pool: mysql.IPool){
  }

  save(toAgent: UUIDString, message: string): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
      this.pool.query('INSERT INTO offlineMessages (uuid, message) VALUES (?,?)', [toAgent.toString(), message], (err) => {
        if(err) return reject(err);
        resolve();
      });
    });
  }

  getFor(id: UUIDString): Promise<string[]> {
    return new Promise<string[]>( (resolve, reject) => {
      this.pool.query('SELECT message FROM offlineMessages WHERE uuid=?', id.toString(), (err, rows) => {
        if(err) return reject(err);
        resolve(rows);
      })
    }).then( (rows: any) => {
      return rows.map( (r) => {return r.message;});
    });
  }

  clearFor(id: UUIDString): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
      this.pool.query('DELETE FROM offlineMessages WHERE uuid=?', id.toString(), (err) => {
        if(err) return reject(err);
        resolve();
      });
    });
  }
}
