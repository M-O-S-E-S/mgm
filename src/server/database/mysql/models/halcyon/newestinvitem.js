/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('newestinvitem', {
    inventoryid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    creationdate: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'newestinvitem'
  });
};
