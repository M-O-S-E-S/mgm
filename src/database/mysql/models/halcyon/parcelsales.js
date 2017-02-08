/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('parcelsales', {
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
    area: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    },
    saleprice: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    landingpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    infoUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    dwell: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    parentestate: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    mature: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'false'
    }
  }, {
    tableName: 'parcelsales'
  });
};
