import * as Sequelize from 'sequelize';

export interface EstateBanAttribute {
  EstateID: number
  bannedUUID: string
  bannedIp: string
  bannedIpHostMask: string
  bannedNameMask: string
}

export interface EstateBanInstance extends Sequelize.Instance<EstateBanAttribute>, EstateBanAttribute {

}

export interface EstateBanModel extends Sequelize.Model<EstateBanInstance, EstateBanAttribute> {

}


export function estateban(sequelize, DataTypes): EstateBanModel {
  return sequelize.define('estateban', {
    EstateID: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    bannedUUID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bannedIp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bannedIpHostMask: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bannedNameMask: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'estateban',
    timestamps: false
  });
};
