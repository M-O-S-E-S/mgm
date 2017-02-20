
import { IPool } from 'mysql';

import { IPendingUser } from '../Types';
import { Credential } from '../Auth';

interface pending_user_row {
  name: string
  email: string
  gender: string
  password: string
  registered: Date
  summary: string
}

export class PendingUsers {
  private db: IPool

  constructor(db: IPool) {
    this.db = db;
  }

  getAll(): Promise<IPendingUser[]> {
    return new Promise<IPendingUser[]>((resolve, reject) => {
      this.db.query('SELECT * FROM users', (err, rows: pending_user_row[]) => {
        if (err) return reject(err);
        resolve(rows || []);
      })
    });
  }

  create(name: string, email: string, template: string, credential: Credential, summary: string): Promise<IPendingUser> {
    return new Promise<IPendingUser>((resolve, reject) => {
      let user: IPendingUser = {
        name: name,
        email: email,
        gender: template,
        password: credential.hash,
        registered: new Date(),
        summary: summary
      }
      this.db.query('INSERT INTO users SET ?', user, (err: Error) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  }

  /*
  getByName(name: string): Promise<PendingUser> {
    return this.db.findOne({
      where: {
        Name: name
      }
    });
  }
  */
}