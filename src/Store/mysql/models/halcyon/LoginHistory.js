/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('LoginHistory', {
    session_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    login_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    logout_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    session_ip: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_region: {
      type: DataTypes.CHAR(36),
      allowNull: false
    }
  }, {
    tableName: 'LoginHistory'
  });
};
