
import { UUIDString } from '../halcyon/UUID';
import { Sql } from '../mysql/sql';

export class Estate {
  id: number
  name: string
  owner: UUIDString
  managers: UUIDString[]
  regions: UUIDString[]
}

export class EstateMgr {
  private static _instance: EstateMgr = null;
  private db: Sql
  private estates: { [key: number]: Estate } = [];

  constructor(sql: Sql) {
    if (EstateMgr._instance) {
      throw new Error('RegionMgr singleton has already been initialized');
    }
    this.db = sql;
    this.initialize();

    EstateMgr._instance = this;
  }

  public static instance(): EstateMgr {
    return EstateMgr._instance;
  }

  getAllEstates(): Promise<Estate[]> {
    let estates: Estate[] = [];
    for (let id in this.estates) {
      estates.push(this.estates[id]);
    }
    return Promise.resolve(estates);
  }

  getEstate(id: number): Promise<Estate> {
    if (id in this.estates) {
      return Promise.resolve(this.estates[id]);
    }
    return Promise.reject(new Error('Estate ' + id + ' does not exist'));
  }

  createEstate(name: string, owner: UUIDString): Promise<Estate> {
    return new Promise<number>((resolve, reject) => {
      let args = {
        EstateName: name,
        EstateOwner: owner.toString(),
        AbuseEmailToEstateOwner: 0,
        DenyAnonymous: 1,
        ResetHomeOnTeleport: 0,
        FixedSun: 0,
        DenyTransacted: 0,
        BlockDwell: 0,
        DenyIdentified: 0,
        AllowVoice: 0,
        UseGlobalTime: 1,
        PricePerMeter: 0,
        TaxFree: 1,
        AllowDirectTeleport: 1,
        RedirectGridX: 0,
        RedirectGridY: 0,
        ParentEstateID: 0,
        SunPosition: 0,
        EstateSkipScripts: 0,
        BillableFactor: 0,
        PublicAccess: 1,
        AbuseEmail: '',
        DenyMinors: 0,
      }
      this.db.pool.query('INSERT INTO estate_settings SET ?', args, (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      })
    }).then((id: number) => {
      let e = new Estate();
      e.id = id;
      e.name = name;
      e.owner = owner;
      e.managers = [];
      e.regions = [];
      return e;
    }).then((e: Estate) => {
      this.estates[e.id] = e;
      return e;
    });
  }

  destroyEstate(e: Estate): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM estateban WHERE EstateID=?', e.id, (err) => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_groups WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_managers WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_map WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_settings WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_users WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      delete this.estates[e.id];
    });
  }

  private initialize(): Promise<any> {
    return new Promise<any[]>((resolve, reject) => {
      this.db.pool.query('SELECT EstateID, EstateName, EstateOwner FROM estate_settings WHERE 1', (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      })
    }).then((rows: any[]) => {
      let jobs = rows.map((r: any) => {
        let e = new Estate();
        e.id = r.EstateID;
        e.name = r.EstateName;
        e.owner = new UUIDString(r.EstateOwner);
        return this.loadManagersForEstate(e)
          .then( () => this.loadRegionsForEstate(e))
          .then( (e: Estate) => {
            this.estates[e.id] = e;
          })
      });
      return Promise.all(jobs);
    }).catch( (err) => {
      console.log('EstateMgr: ' + err);
    })
  }

  private loadManagersForEstate(e: Estate): Promise<Estate> {
    return new Promise<any[]>((resolve, reject) => {
      this.db.pool.query('SELECT uuid FROM estate_managers WHERE EstateID=?', e.id, (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows);
      })
    }).then((rows: any[]) => {
      let ids: UUIDString[] = [];
      for (let r of rows) {
        ids.push(new UUIDString(r.uuid));
      }
      e.managers = ids;
      return e;
    });
  }

  private loadRegionsForEstate(e: Estate): Promise<Estate> {
    return new Promise<any[]>((resolve, reject) => {
      this.db.pool.query('SELECT RegionID FROM estate_map WHERE EstateID=?', e.id, (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows);
      })
    }).then((rows: any[]) => {
      let ids: UUIDString[] = [];
      for (let r of rows) {
        ids.push(new UUIDString(r.RegionID));
      }
      e.regions = ids;
      return e;
    });
  }

}
