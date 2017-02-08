/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('avatarattachments', {
    UUID: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    attachpoint: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    }
  }, {
    tableName: 'avatarattachments'
  });
};
