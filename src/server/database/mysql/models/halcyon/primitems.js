/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('primitems', {
    invType: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    assetType: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    creationDate: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    nextPermissions: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    currentPermissions: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    basePermissions: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    everyonePermissions: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    groupPermissions: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    flags: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    itemID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '',
      primaryKey: true
    },
    primID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    assetID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    parentFolderID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    creatorID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    ownerID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    groupID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    lastOwnerID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    canDebitOwner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'primitems'
  });
};
