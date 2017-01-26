
import * as Sequelize from 'sequelize';

export interface MembershipAttribute {
  GroupID: string
  AgentID: string
  SelectedRoleID: string
  Contribution: number
  ListInProfile: number
  AcceptNotices: number
}

export interface MembershipInstance extends Sequelize.Instance<MembershipAttribute>, MembershipAttribute {

}

export interface MembershipModel extends Sequelize.Model<MembershipInstance, MembershipAttribute> {
  
}


export function osGroupMembership(sequelize, DataTypes): MembershipModel {
  return sequelize.define('osgroupmembership', {
    GroupID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    AgentID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    SelectedRoleID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Contribution: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    ListInProfile: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    AcceptNotices: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'osgroupmembership',
    timestamps: false
  });
};
