/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('offlines', {
    fromAgentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fromAgentName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toAgentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dialogVal: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    fromGroupVal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    offlineMessage: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    messageId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    xPos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    yPos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zPos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    binaryBucket: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentEstateId: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    regionId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    messageTimestamp: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    offlineVal: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    }
  }, {
    tableName: 'offlines'
  });
};
