import * as Sequelize from 'sequelize';

export interface GroupAttribute {
  GroupID: string
    Name: string
    Charter: string
    InsigniaID: string
    FounderID: string
    MembershipFee: number
    OpenEnrollment: string
    ShowInList: boolean
    AllowPublish: boolean
    MaturePublish: boolean
    OwnerRoleID: string
}

export interface GroupInstance extends Sequelize.Instance<GroupAttribute>, GroupAttribute {

}

export interface GroupModel extends Sequelize.Model<GroupInstance, GroupAttribute> {
  
}


export function osGroup(sequelize, DataTypes): GroupModel {
  return sequelize.define('osgroup', {
    GroupID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    Charter: {
      type: DataTypes.STRING,
      allowNull: false
    },
    InsigniaID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    FounderID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    MembershipFee: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    OpenEnrollment: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ShowInList: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    AllowPublish: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    MaturePublish: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    OwnerRoleID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'osgroup',
    timestamps: false
  });
};
