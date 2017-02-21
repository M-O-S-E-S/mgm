
import { IPool } from 'promise-mysql';

import { IGroup, IMember, IRole } from '../Types';

interface group_row {
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

interface member_row {
  GroupID: string
  AgentID: string
  SelectedRoleID: string
  Contribution: number
  ListInProfile: number
  AcceptNotices: number
}

interface role_row {
  GroupID: string
  RoleID: string
  Name: string
  Description: string
  Title: string
  Powers: number
}

export class Groups {
  private db: IPool


  constructor(db: IPool) {
    this.db = db;
  }

  getAll(): Promise<IGroup[]> {
    return this.db.query('SELECT * FROM osgroup WHERE 1');
  }

  getMembers(): Promise<IMember[]> {
    return this.db.query('SELECT * FROM osgroupmembership WHERE 1');
  }

  getRoles(): Promise<IRole[]> {
    return this.db.query('SELECT * FROM osrole WHERE 1');
  }

  /*
  getGroupByID(id: string): Promise<GroupInstance> {
    return this.groups.findOne({
      where: {
        GroupID: id
      }
    })
  }

  getRoleByID(group: string, role: string): Promise<RoleInstance> {
    return this.roles.findOne({
      where: {
        RoleID: role,
        GroupID: group
      }
    })
  }

  getMembershipForUser(group: string, user: string): Promise<MembershipInstance[]> {
    return this.membership.findAll({
      where: {
        AgentID: user,
        GroupID: group
      }
    })
  }

  addUserToGroup(group: string, user: string, role: string): Promise<MembershipInstance> {
    return this.membership.create({
      GroupID: group,
      AgentID: user,
      SelectedRoleID: role,
      Contribution: 0,
      ListInProfile: 1,
      AcceptNotices: 1
    });
  }
  */
}
