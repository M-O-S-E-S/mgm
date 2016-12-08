
import * as Sequelize from 'sequelize';
import {
  EstateInstance, EstateAttribute,
  ManagerInstance, ManagerAttribute,
  EstateMapInstance, EstateMapAttribute,
  EstateBanInstance, EstateBanAttribute,
  EstateGroupInstance, EstateGroupAttribute,
  EstateUserInstance, EstateUserAttribute
} from './mysql';

export class Estates {
  private estates: Sequelize.Model<EstateInstance, EstateAttribute>
  private managers: Sequelize.Model<ManagerInstance, ManagerAttribute>
  private estateMap: Sequelize.Model<EstateMapInstance, EstateMapAttribute>
  private estateBan: Sequelize.Model<EstateBanInstance, EstateBanAttribute>
  private estateGroup: Sequelize.Model<EstateGroupInstance, EstateGroupAttribute>
  private estateUser: Sequelize.Model<EstateUserInstance, EstateUserAttribute>

  constructor(
    estates: Sequelize.Model<EstateInstance, EstateAttribute>,
    managers: Sequelize.Model<ManagerInstance, ManagerAttribute>,
    estateMap: Sequelize.Model<EstateMapInstance, EstateMapAttribute>,
    estateBan: Sequelize.Model<EstateBanInstance, EstateBanAttribute>,
    estateGroup: Sequelize.Model<EstateGroupInstance, EstateGroupAttribute>,
    estateUser: Sequelize.Model<EstateUserInstance, EstateUserAttribute>
  ) {
    this.estates = estates;
    this.managers = managers;
    this.estateMap = estateMap;
    this.estateBan = estateBan;
    this.estateGroup = estateGroup;
    this.estateUser = estateUser;
  }

  getAll(): Promise<EstateInstance[]> {
    return this.estates.findAll();
  }

  getEstateByID(id: number): Promise<EstateInstance> {
    return this.estates.findOne({
      where: {
        EstateId: id
      }
    });
  }

  getManagers(): Promise<ManagerInstance[]> {
    return this.managers.findAll();
  }

  getMapping(): Promise<EstateMapInstance[]> {
    return this.estateMap.findAll();
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
}
