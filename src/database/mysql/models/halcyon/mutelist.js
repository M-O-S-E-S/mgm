/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mutelist', {
    AgentID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    MuteID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    MuteType: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    MuteName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    MuteFlags: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'mutelist'
  });
};
