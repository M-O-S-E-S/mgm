/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ValidInboundMoneySources', {
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'ValidInboundMoneySources'
  });
};
