/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('osagent', {
    AgentID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    ActiveGroupID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'osagent'
  });
};
