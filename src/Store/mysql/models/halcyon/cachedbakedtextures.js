/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cachedbakedtextures', {
    cache: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    texture: {
      type: DataTypes.CHAR(36),
      allowNull: false
    }
  }, {
    tableName: 'cachedbakedtextures'
  });
};
