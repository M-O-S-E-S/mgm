
import { UUIDString } from '../halcyon/UUID';
import { Region, RegionMgr } from './Region';
import { Sql } from '../mysql/sql';

export interface Host {
  getAddress(): string
  getPort(): number
  setPort(number): Promise<Host>
  getName(): string
  setName(string): Promise<Host>
  getStatus(): any
  setStatus(any)
  getSlots(): number
  setSlots(slots: number): Promise<Host>
}

export class HostObj implements Host {
  db: Sql
  address: string
  port: number
  name: string
  slots: number
  status: any

  constructor(db: Sql) {
    this.db = db;
  }

  getAddress(): string {
    return this.address;
  }

  getPort(): number {
    return this.port;
  }

  setPort(port: number): Promise<Host> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE hosts SET port=? WHERE address=?',
        [port, this.address], (err) => {
          if (err)
            return reject(err);
          resolve();
        })
    }).then(() => {
      this.port = port;
      return this;
    })
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): Promise<Host> {
    console.log('Host at ' + this.address + ' is named ' + name);
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE hosts SET name=? WHERE address=?',
        [name, this.address], (err) => {
          if (err)
            return reject(err);
          resolve();
        })
    }).then(() => {
      this.name = name;
      return this;
    })
  }

  getStatus(): any {
    return this.status;
  }

  setStatus(stat: any) {
    this.status = stat;
  }

  getSlots(): number {
    return this.slots;
  }

  setSlots(slots: number): Promise<Host> {
    return new Promise<Host>((resolve, reject) => {
      this.db.pool.query('UPDATE hosts SET slots=? WHERE address=?',
        [slots, this.address], (err) => {
          if (err)
            return reject(err);
          resolve();
        })
    }).then(() => {
      this.slots = slots;
      return this;
    })
  }
}

export class HostMgr {
  private static _instance: HostMgr = null;
  private db: Sql
  private hosts: { [key: string]: Host } = {}

  constructor(db: Sql) {
    if (HostMgr._instance) {
      throw new Error('RegionMgr singleton has already been initialized');
    }
    this.db = db;
    this.initialize();

    HostMgr._instance = this;
  }

  public static instance(): HostMgr {
    return HostMgr._instance;
  }

  getAll(): Promise<Host[]> {
    let hosts: Host[] = [];
    for (let id in this.hosts) {
      hosts.push(this.hosts[id]);
    }
    return Promise.resolve(hosts);
  }

  get(address: string): Promise<Host> {
    if (address in this.hosts) {
      return Promise.resolve(this.hosts[address]);
    }
    return Promise.reject(new Error('Host ' + address + ' does not exist'));
  }

  insert(address: string): Promise<Host> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('INSERT INTO hosts (address) VALUES (?)',
        [address], (err) => {
          if (err)
            return reject(err);
          resolve();
        })
    }).then(() => {
      let h = new HostObj(this.db)
      h.address = address;
      this.hosts[h.address] = h;
      return h;
    });
  }

  delete(address: string): Promise<void> {
    return HostMgr.instance().get(address).then((h: Host) => {
      return new Promise<Host>((resolve, reject) => {
        this.db.pool.query('DELETE FROM hosts WHERE address=?', address, (err) => {
          if (err)
            return reject(err);
          resolve(h);
        });
      })
    }).then( (h: Host) => {
      delete this.hosts[h.getAddress()];
      return h;
    }).then((h: Host) => {
      return RegionMgr.instance().getRegionsOn(h);
    }).then( (regions: Region[]) => {
      for(let r of regions){
        r.setRunning(false);
      }
    });
  }

  private initialize() {
    return new Promise<Host[]>((resolve, reject) => {
      this.db.pool.query('SELECT address, name, slots, port FROM hosts WHERE 1', (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      for (let r of rows) {
        let h = this.buildHost(r);
        this.hosts[h.address] = h;
      }
    }).catch((err: Error) => {
      console.log(err);
    })
  }

  private buildHost(row: any): HostObj {
    let h = new HostObj(this.db);
    h.address = row.address;
    h.port = row.port;
    h.name = row.name;
    h.slots = row.slots;
    return h;
  }
}
