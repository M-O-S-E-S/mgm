
import * as Sequelize from 'sequelize';

export interface RoleAttribute {
  GroupID: string
  RoleID: string
  Name: string
  Description: string
  Title: string
  Powers: number
}

export interface RoleInstance extends Sequelize.Instance<RoleAttribute>, RoleAttribute {

}

export interface RoleModel extends Sequelize.Model<RoleInstance, RoleAttribute> {
  
}


export function osRole(sequelize, DataTypes): RoleModel {
  return sequelize.define('osrole', {
    GroupID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    RoleID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Powers: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    tableName: 'osrole',
    timestamps: false
  });
};
