/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('parcels', {
    regionUUID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    parcelname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parcelUUID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    landingpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    searchcategory: {
      type: DataTypes.STRING,
      allowNull: false
    },
    build: {
      type: DataTypes.ENUM('true','false'),
      allowNull: false
    },
    script: {
      type: DataTypes.ENUM('true','false'),
      allowNull: false
    },
    public: {
      type: DataTypes.ENUM('true','false'),
      allowNull: false
    },
    dwell: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    infouuid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    }
  }, {
    tableName: 'parcels'
  });
};
