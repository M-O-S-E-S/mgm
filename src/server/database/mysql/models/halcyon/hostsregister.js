/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hostsregister', {
    host: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    port: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
      primaryKey: true
    },
    register: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    lastcheck: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    failcounter: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    }
  }, {
    tableName: 'hostsregister'
  });
};
