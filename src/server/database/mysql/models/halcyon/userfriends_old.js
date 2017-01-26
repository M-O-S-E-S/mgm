/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userfriends_old', {
    ownerID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    friendID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    friendPerms: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    datetimestamp: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'userfriends_old'
  });
};
