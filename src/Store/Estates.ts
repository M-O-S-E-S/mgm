import { IPool } from 'mysql';

import { IEstate, IManager, IEstateMap } from '../Types';

interface estate_row {
  EstateID: number
  EstateName: string
  AbuseEmailToEstateOwner: number
  DenyAnonymous: number
  ResetHomeOnTeleport: number
  FixedSun: number
  DenyTransacted: number
  BlockDwell: number
  DenyIdentified: number
  AllowVoice: number
  UseGlobalTime: number
  PricePerMeter: number
  TaxFree: number
  AllowDirectTeleport: number
  RedirectGridX: number
  RedirectGridY: number
  ParentEstateID: number
  SunPosition: number
  EstateSkipScripts: number
  BillableFactor: number
  PublicAccess: number
  AbuseEmail: string
  EstateOwner: string
  DenyMinors: number
}

interface manager_row {
  EstateID: number
  uuid: string
}

interface estate_map_row {
  RegionID: string
  EstateID: number
}

class Estate implements IEstate {
  EstateID: number
  EstateName: string
  EstateOwner: string

  constructor(e: estate_row) {
    this.EstateID = e.EstateID;
    this.EstateName = e.EstateName;
    this.EstateOwner = e.EstateOwner;
  }
}

export class Estates {
  private db: IPool

  constructor(db: IPool) {
    this.db = db;
  }

  getAll(): Promise<IEstate[]> {
    return new Promise<Estate[]>((resolve, reject) => {
      this.db.query('SELECT * FROM estate_settings WHERE 1', (err, rows: estate_row[]) => {
        if (err)
          return reject(err);
        resolve(rows.map((row) => {
          return new Estate(row);
        }));
      });
    });
  }

  getManagers(): Promise<IManager[]> {
    return new Promise<IManager[]>((resolve, reject) => {
      this.db.query('SELECT * FROM estate_managers WHERE 1', (err, rows: manager_row[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  getMapping(): Promise<IEstateMap[]> {
    return new Promise<IEstateMap[]>((resolve, reject) => {
      this.db.query('SELECT * FROM estate_map WHERE 1', (err: Error, rows: estate_map_row[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  /*
  

  getEstateByID(id: number): Promise<EstateInstance> {
    return this.estates.findOne({
      where: {
        EstateId: id
      }
    });
  }

  getMapForRegion(region: string): Promise<EstateMapInstance> {
    return this.estateMap.findOne({
      where: {
        RegionID: region
      }
    });
  }

  setMapForRegion(estate: number, region: string): Promise<EstateMapInstance> {
    return this.estateMap.create({
      RegionID: region,
      EstateID: estate
    });
  }

  create(name: string, owner: string): Promise<EstateInstance> {
    return this.estates.create({
      EstateName: name,
      EstateOwner: owner,
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
    })
  }

  destroy(id: number): Promise<void> {
    return this.estateMap.findAll({
      where: {
        EstateID: id
      }
    }).then((mapper: EstateMapInstance[]) => {
      if (mapper.length > 0) {
        throw new Error('Cannot delete an estate with member regions');
      }
    }).then(() => {
      // destroy the primary record in estate_settings
      return this.estates.destroy({ where: { EstateID: id } });
    }).then(() => {
      //estate settings succeeded, ignore errors on the rest
      this.estateBan.destroy({ where: { EstateID: id } });
      this.estateGroup.destroy({ where: { EstateID: id } });
      this.managers.destroy({ where: { EstateID: id } });
      // don't need this one, we already know there are no regions on it
      //halDB.estateMap.destroy({ where: { EstateID: estateID } });
      this.estateUser.destroy({ where: { EstateID: id } });
    })
  }
  */
}
