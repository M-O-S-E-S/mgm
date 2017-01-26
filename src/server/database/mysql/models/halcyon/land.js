/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('land', {
    UUID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    RegionUUID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocalLandID: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Bitmap: {
      type: 'LONGBLOB',
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OwnerUUID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsGroupOwned: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Area: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    AuctionID: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Category: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ClaimDate: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ClaimPrice: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    GroupUUID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SalePrice: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    LandStatus: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    LandFlags: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    LandingType: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    MediaAutoScale: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    MediaTextureUUID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MediaURL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MusicURL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PassHours: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    PassPrice: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    SnapshotUUID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UserLocationX: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    UserLocationY: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    UserLocationZ: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    UserLookAtX: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    UserLookAtY: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    UserLookAtZ: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    AuthbuyerID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    OtherCleanTime: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    Dwell: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'land'
  });
};
