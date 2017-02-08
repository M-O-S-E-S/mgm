/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('agents', {
    UUID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    sessionID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    secureSessionID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    agentIP: {
      type: DataTypes.STRING,
      allowNull: false
    },
    agentPort: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    agentOnline: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    loginTime: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    logoutTime: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    currentRegion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    currentHandle: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    currentPos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    currentLookAt: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    }
  }, {
    tableName: 'agents'
  });
};
