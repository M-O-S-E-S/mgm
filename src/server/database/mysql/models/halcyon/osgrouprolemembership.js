/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('osgrouprolemembership', {
    GroupID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    RoleID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    AgentID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'osgrouprolemembership'
  });
};
