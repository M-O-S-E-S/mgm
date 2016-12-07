
import { Sql } from '../mysql/sql';
import { Credential } from '../halcyon/User';

export interface PendingUser {
  getName():string
  getEmail():string
  getPassword(): Credential
  getRegistered(): Date
  getGender(): string
  getSummary(): string
}

class UserObj implements PendingUser {
  name: string
  email: string
  gender: string
  password: Credential
  registered: Date
  summary: string

  getName():string {
    return this.name;
  }
  getEmail():string {
    return this.email;
  }
  getRegistered():Date {
    return this.registered;
  }
  getGender(): string {
    return this.gender;
  }
  getSummary(): string {
    return this.summary;
  }
  getPassword():Credential {
    return this.password;
  }
}

export class PendingUserMgr {
  private static _instance: PendingUserMgr = null;
  private db: Sql
  private users: { [key: string]: UserObj } = {}

  constructor(db: Sql) {
    if (PendingUserMgr._instance) {
      throw new Error('PendingUserMgr singleton has already been initialized');
    }
    this.db = db;
    this.initialize();

    PendingUserMgr._instance = this;
  }

  public static instance(): PendingUserMgr {
    return PendingUserMgr._instance;
  }

  getAll(): Promise<PendingUser[]> {
    let users: PendingUser[] = [];
    for (let id in this.users) {
      users.push(this.users[id]);
    }
    return Promise.resolve(users);
  }

  getByName(name:string): Promise<PendingUser> {
    for(let uName in this.users){
      if(uName === name){
        return Promise.resolve(this.users[name]);
      }
    }
    return Promise.reject(new Error('Pending User ' + name + ' does not exist'));
  }

  insert(name: string, email:string, gender:string, password:Credential, summary:string): Promise<PendingUser> {
    let d = new Date();
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('INSERT INTO users (name, email, gender, password, registered, summary) VALUES (?,?,?,?,?,?)',
        [name,email,gender,password.hash,d,summary], (err) => {
          if (err)
            return reject(err);
          resolve();
        })
    }).then(() => {
      let u = new UserObj()
      u.name = name;
      u.email = email;
      u.gender = gender;
      u.password = password;
      u.registered = d;
      u.summary = summary;
      this.users[u.name] = u;
      return u;
    });
  }

  delete(name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM users WHERE name=?', name, (err) => {
        if (err)
          return reject(err);
        resolve();
      });
    }).then( () => {
      delete this.users[name];
    });
  }

  private initialize() {
    return new Promise<any[]>((resolve, reject) => {
      this.db.pool.query('SELECT name, email, gender, password, registered, summary FROM users WHERE 1', (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      for (let r of rows) {
        let u = this.buildUser(r);
        this.users[u.name] = u;
      }
    }).catch((err: Error) => {
      console.log(err);
    })
  }

  private buildUser(row: any): UserObj {
    let u = new UserObj();
    u.name = row.name;
    u.email = row.email;
    u.gender = row.gender;
    u.registered = row.registered;
    u.password = Credential.fromHalcyon(row.password);
    u.summary = row.summary;
    return u;
  }
}
