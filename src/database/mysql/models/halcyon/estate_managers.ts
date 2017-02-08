import * as Sequelize from 'sequelize';

export interface ManagerAttribute {
  EstateId: number
  uuid: string
  ID: number
}

export interface ManagerInstance extends Sequelize.Instance<ManagerAttribute>, ManagerAttribute {

}

export interface ManagerModel extends Sequelize.Model<ManagerInstance, ManagerAttribute> {

}

export function estate_managers(sequelize, DataTypes): ManagerModel {
  return sequelize.define('estate_managers', {
    EstateId: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ID: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    tableName: 'estate_managers',
    timestamps: false
  });
};
