/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('usernotes', {
    useruuid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    targetuuid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'usernotes'
  });
};
