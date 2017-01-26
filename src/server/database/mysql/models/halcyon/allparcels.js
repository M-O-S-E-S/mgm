/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('allparcels', {
    regionUUID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parcelname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    groupUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    landingpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parcelUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000',
      primaryKey: true
    },
    infoUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    parcelarea: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'allparcels'
  });
};
