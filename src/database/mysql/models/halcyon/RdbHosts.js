/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RdbHosts', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    host_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'RdbHosts'
  });
};
