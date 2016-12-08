import * as Sequelize from 'sequelize';

export interface EstateUserAttribute {
  EstateID: number
  uuid: string
}

export interface EstateUserInstance extends Sequelize.Instance<EstateUserAttribute>, EstateUserAttribute {

}

export interface EstateUserModel extends Sequelize.Model<EstateUserInstance, EstateUserAttribute> {

}

export function estate_users(sequelize, DataTypes): EstateUserModel {
  return sequelize.define('estate_users', {
    EstateID: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    uuid: {
      type: DataTypes.CHAR(36),
      allowNull: false
    }
  }, {
    tableName: 'estate_users',
    timestamps: false
  });
};
