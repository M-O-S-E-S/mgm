/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('InventoryMigrationStatus', {
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    }
  }, {
    tableName: 'InventoryMigrationStatus'
  });
};
