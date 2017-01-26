import * as Sequelize from 'sequelize';

export interface EstateGroupAttribute {
  EstateID: number
  uuid: string
}

export interface EstateGroupInstance extends Sequelize.Instance<EstateGroupAttribute>, EstateGroupAttribute {

}

export interface EstateGroupModel extends Sequelize.Model<EstateGroupInstance, EstateGroupAttribute> {

}

export function estate_groups(sequelize, DataTypes): EstateGroupModel {
  return sequelize.define('estate_groups', {
    EstateID: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    uuid: {
      type: DataTypes.CHAR(36),
      allowNull: false
    }
  }, {
      tableName: 'estate_groups',
      timestamps: false
    });
};
