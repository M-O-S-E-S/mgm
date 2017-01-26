import * as Sequelize from 'sequelize';

export interface AvatarAppearanceAttribute {
  Owner: string
  Serial: number
  Visual_Params: string
  Texture: string
  Avatar_Height: number
  Body_Item: string
  Body_Asset: string
  Skin_Item: string
  Skin_Asset: string
  Hair_Item: string
  Hair_Asset: string
  Eyes_Item: string
  Eyes_Asset: string
  Shirt_Item: string
  Shirt_Asset: string
  Pants_Item: string
  Pants_Asset: string
  Shoes_Item: string
  Shoes_Asset: string
  Socks_Item: string
  Socks_Asset: string
  Jacket_Item: string
  Jacket_Asset: string
  Gloves_Item: string
  Gloves_Asset: string
  Undershirt_Item: string
  Undershirt_Asset: string
  Underpants_Item: string
  Underpants_Asset: string
  Skirt_Item: string
  Skirt_Asset: string
  alpha_item: string
  alpha_asset: string
  tattoo_item: string
  tattoo_asset: string
  physics_item: string
  physics_asset: string
}

export interface AvatarAppearanceInstance extends Sequelize.Instance<AvatarAppearanceAttribute>, AvatarAppearanceAttribute {

}

export interface AvatarAppearanceModel extends Sequelize.Model<AvatarAppearanceInstance, AvatarAppearanceAttribute> {

}

export function avatarAppearance(sequelize, DataTypes): AvatarAppearanceModel {
  return sequelize.define('avatarappearance', {
    Owner: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
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
      allowNull: false
    },
    Body_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Skin_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Skin_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Hair_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Hair_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Eyes_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Eyes_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Shirt_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Shirt_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Pants_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Pants_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Shoes_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Shoes_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Socks_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Socks_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Jacket_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Jacket_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Gloves_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Gloves_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Undershirt_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Undershirt_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Underpants_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Underpants_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Skirt_Item: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    Skirt_Asset: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    alpha_item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    alpha_asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    tattoo_item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    tattoo_asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    physics_item: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    physics_asset: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    }
  }, {
      tableName: 'avatarappearance',
      timestamps: false
    });
};
