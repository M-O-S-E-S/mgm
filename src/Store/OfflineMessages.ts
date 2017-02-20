import { IPool } from 'mysql';

interface offline_row {
  uuid: string,
  message: string
}

export class OfflineMessages {
  private db: IPool

  constructor(db: IPool) {
    this.db = db;
  }

  getFor(uuid: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.db.query('SELECT * FROM offlineMessages WHERE uuid=?', uuid, (err: Error, rows: offline_row[]) => {
        if (err) return reject(err);
        resolve(rows.map((r: offline_row) => { return r.message }))
      });
    });
  }

  destroyFor(uuid: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.query('DELETE FROM offlineMessages WHERE uuid=?', uuid, (err: Error) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  save(uuid: string, message: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.query('INSERT INTO offlineMessages SET ?', <offline_row>{ uuid: uuid, message: message }, (err: Error) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}