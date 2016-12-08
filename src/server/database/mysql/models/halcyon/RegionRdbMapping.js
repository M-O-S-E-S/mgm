/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegionRdbMapping', {
    region_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    rdb_host_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'RegionRdbMapping'
  });
};
