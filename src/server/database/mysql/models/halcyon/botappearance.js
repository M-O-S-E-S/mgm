/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('botappearance', {
    Owner: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    OutfitName: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    LastUsed: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Serial: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    Visual_Params: {
      type: 'BLOB',
      allowNull: false
    },
    Texture: {
      type: 'BLOB',
      allowNull: false
    },
    Avatar_Height: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    Body_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Body_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Skin_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Skin_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Hair_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Hair_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Eyes_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Eyes_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Shirt_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Shirt_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Pants_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Pants_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Shoes_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Shoes_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Socks_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Socks_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Jacket_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Jacket_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Gloves_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Gloves_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Undershirt_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Undershirt_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Underpants_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Underpants_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Skirt_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Skirt_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Alpha_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Alpha_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Tattoo_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Tattoo_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Physics_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    Physics_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    }
  }, {
    tableName: 'botappearance'
  });
};
