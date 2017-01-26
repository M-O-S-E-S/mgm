/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userpicks', {
    pickuuid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    creatoruuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toppick: {
      type: DataTypes.ENUM('true','false'),
      allowNull: false
    },
    parceluuid: {
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
    snapshotuuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalname: {
      type: DataTypes.STRING,
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
    sortorder: {
      type: DataTypes.INTEGER(2),
      allowNull: false
    },
    enabled: {
      type: DataTypes.ENUM('true','false'),
      allowNull: false
    }
  }, {
    tableName: 'userpicks'
  });
};
