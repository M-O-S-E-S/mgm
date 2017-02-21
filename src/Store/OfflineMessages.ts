import { IPool } from 'promise-mysql';

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
    return this.db.query('SELECT * FROM offlineMessages WHERE uuid=?', uuid).then((rows: offline_row[]) => {
      return rows.map((r: offline_row) => { return r.message });
    });
  }

  destroyFor(uuid: string): Promise<void> {
    return this.db.query('DELETE FROM offlineMessages WHERE uuid=?', uuid);
  }

  save(uuid: string, message: string): Promise<void> {
    return this.db.query('INSERT INTO offlineMessages SET ?', <offline_row>{ uuid: uuid, message: message });
  }
}