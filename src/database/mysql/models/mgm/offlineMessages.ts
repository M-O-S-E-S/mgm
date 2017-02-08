
import * as Sequelize from 'sequelize';

export interface OfflineMessageAttribute {
  uuid: string
  message: string
}

export interface OfflineMessageInstance extends Sequelize.Instance<OfflineMessageAttribute>, OfflineMessageAttribute {

}

export interface OfflineMessageModel extends Sequelize.Model<OfflineMessageInstance, OfflineMessageAttribute> {
  
}

export function offlineMessages(sequelize, DataTypes): OfflineMessageModel {
  return sequelize.define('offlineMessages', {
    uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'offlineMessages',
    timestamps: false
  });
};
