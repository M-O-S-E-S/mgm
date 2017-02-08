import * as Sequelize from 'sequelize';

export interface EstateAttribute {
  EstateID?: number
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

export interface EstateInstance extends Sequelize.Instance<EstateAttribute>, EstateAttribute {

}

export interface EstateModel extends Sequelize.Model<EstateInstance, EstateAttribute> {

}


export function estate_settings(sequelize, DataTypes): EstateModel {
  return sequelize.define('estate_settings', {
    EstateID: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    EstateName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AbuseEmailToEstateOwner: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    DenyAnonymous: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    ResetHomeOnTeleport: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    FixedSun: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    DenyTransacted: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    BlockDwell: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    DenyIdentified: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    AllowVoice: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    UseGlobalTime: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    PricePerMeter: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    TaxFree: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    AllowDirectTeleport: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    RedirectGridX: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    RedirectGridY: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    ParentEstateID: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    SunPosition: {
      type: 'DOUBLE',
      allowNull: false
    },
    EstateSkipScripts: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    BillableFactor: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    PublicAccess: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    AbuseEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EstateOwner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DenyMinors: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    }
  }, {
      tableName: 'estate_settings',
      timestamps: false
    });
};
