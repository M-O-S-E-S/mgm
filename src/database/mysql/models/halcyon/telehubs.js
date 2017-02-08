/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('telehubs', {
    RegionID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    TelehubLoc: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TelehubRot: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ObjectUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Spawns: {
      type: DataTypes.CHAR(255),
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'telehubs'
  });
};
