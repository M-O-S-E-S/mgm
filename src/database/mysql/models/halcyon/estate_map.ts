
import * as Sequelize from 'sequelize';

export interface EstateMapAttribute {
  RegionID: string
  EstateID: number
}

export interface EstateMapInstance extends Sequelize.Instance<EstateMapAttribute>, EstateMapAttribute {

}

export interface EstateMapModel extends Sequelize.Model<EstateMapInstance, EstateMapAttribute> {
  
}


export function estate_map(sequelize, DataTypes): EstateMapModel {
  return sequelize.define('estate_map', {
    RegionID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000',
      primaryKey: true
    },
    EstateID: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'estate_map',
    timestamps: false
  });
};
