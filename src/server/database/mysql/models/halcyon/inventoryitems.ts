
import * as Sequelize from 'sequelize';

export interface InventoryItemAttribute {
  assetID: string
  assetType: number
  inventoryName: string
  inventoryDescription: string
  inventoryNextPermissions: number
  inventoryCurrentPermissions: number
  invType: number
  creatorID: string
  inventoryBasePermissions: number
  inventoryEveryOnePermissions: number
  salePrice: number
  saleType: number
  creationDate: number
  groupID: string
  groupOwned: number
  flags: number
  inventoryID: string
  avatarID: string
  parentFolderID: string
  inventoryGroupPermissions: number
}

export interface InventoryItemInstance extends Sequelize.Instance<InventoryItemAttribute>, InventoryItemAttribute {

}

export interface InventoryItemModel extends Sequelize.Model<InventoryItemInstance, InventoryItemAttribute> {

}

export function inventoryItems(sequelize, DataTypes): InventoryItemModel {
  return sequelize.define('inventoryitems', {
    assetID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    assetType: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    inventoryName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    inventoryDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    inventoryNextPermissions: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    inventoryCurrentPermissions: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    invType: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    creatorID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    inventoryBasePermissions: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: '0'
    },
    inventoryEveryOnePermissions: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: '0'
    },
    salePrice: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    saleType: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    creationDate: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    groupID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    groupOwned: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    flags: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    inventoryID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000',
      primaryKey: true
    },
    avatarID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    parentFolderID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    inventoryGroupPermissions: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
      tableName: 'inventoryitems',
      timestamps: false
    });
};