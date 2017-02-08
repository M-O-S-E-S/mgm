
import * as Sequelize from 'sequelize';

export interface InventoryFolderAttribute {
  folderName: string
  type: number
  version: number
  folderID: string
  agentID: string
  parentFolderID: string
}

export interface InventoryFolderInstance extends Sequelize.Instance<InventoryFolderAttribute>, InventoryFolderAttribute {

}

export interface InventoryFolderModel extends Sequelize.Model<InventoryFolderInstance, InventoryFolderAttribute> {

}

export function inventoryFolders(sequelize, DataTypes): InventoryFolderModel {
  return sequelize.define('inventoryfolders', {
    folderName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
      defaultValue: '0'
    },
    version: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    folderID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000',
      primaryKey: true
    },
    agentID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    parentFolderID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    }
  }, {
      tableName: 'inventoryfolders',
      timestamps: false
    });
};
