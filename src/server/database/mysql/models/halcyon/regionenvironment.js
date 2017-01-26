/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('regionenvironment', {
    regionUUID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '000000-0000-0000-0000-000000000000',
      primaryKey: true
    },
    llsd_text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'regionenvironment'
  });
};
