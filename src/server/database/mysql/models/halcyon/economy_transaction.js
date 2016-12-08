/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('economy_transaction', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    sourceAvatarID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destAvatarID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transactionAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    transactionType: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    transactionDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timeOccurred: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'economy_transaction'
  });
};
