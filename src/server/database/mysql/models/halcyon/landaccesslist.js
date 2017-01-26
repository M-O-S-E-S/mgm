/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('landaccesslist', {
    LandUUID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AccessUUID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Flags: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'landaccesslist'
  });
};
