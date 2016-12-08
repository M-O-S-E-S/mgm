/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userpreferences', {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
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
    tableName: 'userpreferences'
  });
};
