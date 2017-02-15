/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('events', {
    owneruuid: {
      type: DataTypes.CHAR(40),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    eventid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    creatoruuid: {
      type: DataTypes.CHAR(40),
      allowNull: false
    },
    category: {
      type: DataTypes.INTEGER(2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dateUTC: {
      type: DataTypes.INTEGER(12),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER(3),
      allowNull: false
    },
    covercharge: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    coveramount: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    simname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    globalPos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    eventflags: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    mature: {
      type: DataTypes.ENUM('true','false'),
      allowNull: false
    }
  }, {
    tableName: 'events'
  });
};
