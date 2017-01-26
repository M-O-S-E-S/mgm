/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('classifieds', {
    classifieduuid: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    creatoruuid: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    creationdate: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    },
    expirationdate: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    parceluuid: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    parentestate: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    snapshotuuid: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    simname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    posglobal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parcelname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    classifiedflags: {
      type: DataTypes.INTEGER(8),
      allowNull: false
    },
    priceforlisting: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    }
  }, {
    tableName: 'classifieds'
  });
};
