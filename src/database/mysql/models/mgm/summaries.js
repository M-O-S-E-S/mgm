/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('summaries', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'summaries'
  });
};
