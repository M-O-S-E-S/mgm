/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('economy_totals', {
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    total: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'economy_totals'
  });
};
