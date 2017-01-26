/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('regions', {
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    regionHandle: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    regionName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionRecvKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionSendKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionDataURI: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serverIP: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serverPort: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    serverURI: {
      type: DataTypes.STRING,
      allowNull: true
    },
    locX: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    locY: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    locZ: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    eastOverrideHandle: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    westOverrideHandle: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    southOverrideHandle: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    northOverrideHandle: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    regionAssetURI: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionAssetRecvKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionAssetSendKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionUserURI: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionUserRecvKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionUserSendKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    regionMapTexture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serverHttpPort: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    serverRemotingPort: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    owner_uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    originUUID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    access: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      defaultValue: '1'
    },
    ScopeID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    sizeX: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    sizeY: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    product: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    outside_ip: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'regions'
  });
};
