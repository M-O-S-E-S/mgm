/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userprefs_bak', {
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    recv_ims_via_email: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    listed_in_directory: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'userprefs_bak'
  });
};
