import * as Sequelize from 'sequelize';

export interface JobAttribute {
  id?: number
  timestamp?: string
  type: string
  user: string
  data?: string
}

export interface JobInstance extends Sequelize.Instance<JobAttribute>, JobAttribute {
  
}

export interface JobModel extends Sequelize.Model<JobInstance, JobAttribute> {
  
}

export function jobs(sequelize, DataTypes): JobModel {
  return sequelize.define('jobs', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'jobs',
      timestamps: false
  });
};
