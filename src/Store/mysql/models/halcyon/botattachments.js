/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('botattachments', {
    UUID: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    outfitName: {
      type: DataTypes.STRING,
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
    tableName: 'botattachments'
  });
};
