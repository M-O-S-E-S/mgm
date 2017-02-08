/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_count', {
    u_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    online_u_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    region_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    private_isle_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    mainland_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    scenic_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    sponsored_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    last_refresh: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    unique_user_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'user_count'
  });
};
