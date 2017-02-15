/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('objects', {
    objectuuid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    parceluuid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    regionuuid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    }
  }, {
    tableName: 'objects'
  });
};
