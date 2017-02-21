
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

  addMember(user: IMember): Promise<void> {
    let member: member_row = {
      GroupID: user.GroupID,
      AgentID: user.AgentID,
      SelectedRoleID: user.SelectedRoleID,
      Contribution: 0,
      ListInProfile: 1,
      AcceptNotices: 1
    }
    return this.db.query('INSERT INTO osgroupmembership SET ?', member).then(() => {
      return member;
    });
  }

  removeMember(user: IMember): Promise<void> {
    return this.db.query('DELETE FROM osgroupmembership WHERE GroupID=? AND AgentID=?', [user.GroupID, user.AgentID]);
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
  */
}
