
import * as Sequelize from 'sequelize';

export interface PendingUserAttribute {
  name: string
  email: string
  gender: string
  password: string
  registered?: string
  summary: string
}

export interface PendingUserInstance extends Sequelize.Instance<PendingUserAttribute>, PendingUserAttribute {

}

export interface PendingUserModel extends Sequelize.Model<PendingUserInstance, PendingUserAttribute> {
  
}

export function users(sequelize, DataTypes): PendingUserModel {
  return sequelize.define('users', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    registered: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
      tableName: 'users',
      timestamps: false
    });
};
