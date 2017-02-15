/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('terrain', {
    RegionUUID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
      primaryKey: true
    },
    Revision: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Heightfield: {
      type: 'LONGBLOB',
      allowNull: true
    }
  }, {
    tableName: 'terrain'
  });
};
