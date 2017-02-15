/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('osgroupinvite', {
    InviteID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    GroupID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    RoleID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    AgentID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TMStamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP'
    }
  }, {
    tableName: 'osgroupinvite'
  });
};
