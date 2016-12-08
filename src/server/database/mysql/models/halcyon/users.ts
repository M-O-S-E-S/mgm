
import * as Sequelize from 'sequelize';

export interface UserAttribute {
  UUID: string
  username: string
  lastname: string
  passwordHash: string
  passwordSalt: string
  homeRegion: number
  homeLocationX: number
  homeLocationY: number
  homeLocationZ: number
  homeLookAtX: number
  homeLookAtY: number
  homeLookAtZ: number
  created: number
  lastLogin: number
  userInventoryURI: string
  userAssetURI: string
  profileCanDoMask: number
  profileWantDoMask: number
  profileAboutText: string
  profileFirstText: string
  profileImage: string
  profileFirstImage: string
  webLoginKey: string
  homeRegionID: string
  userFlags: number
  godLevel: number
  iz_level: number
  customType: string
  partner: string
  email: string
  profileURL: string
  skillsMask: number
  skillsText: string
  wantToMask: number
  wantToText: string
  languagesText: string
}

export interface UserInstance extends Sequelize.Instance<UserAttribute>, UserAttribute {

}

export interface UserModel extends Sequelize.Model<UserInstance, UserAttribute> {
  
}

export function users(sequelize, DataTypes): UserModel {
  return sequelize.define('users', {
    UUID: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passwordSalt: {
      type: DataTypes.STRING,
      allowNull: false
    },
    homeRegion: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    homeLocationX: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    homeLocationY: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    homeLocationZ: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    homeLookAtX: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    homeLookAtY: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    homeLookAtZ: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    created: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    lastLogin: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    userInventoryURI: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAssetURI: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profileCanDoMask: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    profileWantDoMask: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    profileAboutText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profileFirstText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profileFirstImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    webLoginKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    homeRegionID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    userFlags: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    godLevel: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    iz_level: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    customType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    partner: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profileURL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    skillsMask: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: '0'
    },
    skillsText: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'None'
    },
    wantToMask: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: '0'
    },
    wantToText: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'None'
    },
    languagesText: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'English'
    }
  }, {
    tableName: 'users',
    timestamps: false
  });
};
