/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('iniConfig', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    region: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false
    },
    item: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'iniConfig'
  });
};
