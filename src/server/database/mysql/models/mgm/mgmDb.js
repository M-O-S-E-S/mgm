/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mgmDb', {
    version: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP'
    }
  }, {
    tableName: 'mgmDb'
  });
};
