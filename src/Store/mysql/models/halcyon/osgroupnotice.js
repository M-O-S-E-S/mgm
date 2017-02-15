/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('osgroupnotice', {
    GroupID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    NoticeID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    Timestamp: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    FromName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    BinaryBucket: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'osgroupnotice'
  });
};
