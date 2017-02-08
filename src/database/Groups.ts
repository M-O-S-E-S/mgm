
import * as Sequelize from 'sequelize';
import {
  GroupInstance, GroupAttribute,
  RoleInstance, RoleAttribute,
  MembershipInstance, MembershipAttribute
} from './mysql';
import { IGroup, IRole, IMembership } from '../common/messages';



export class Groups {
  private groups: Sequelize.Model<GroupInstance, GroupAttribute>
  private roles: Sequelize.Model<RoleInstance, RoleAttribute>
  private membership: Sequelize.Model<MembershipInstance, MembershipAttribute>

  constructor(
    groups: Sequelize.Model<GroupInstance, GroupAttribute>,
    roles: Sequelize.Model<RoleInstance, RoleAttribute>,
    membership: Sequelize.Model<MembershipInstance, MembershipAttribute>
  ) {
    this.groups = groups;
    this.roles = roles;
    this.membership = membership;
  }

  getGroups(): Promise<IGroup[]> {
    return this.groups.findAll().then((groups: GroupInstance[]) => {
      return groups.map((g: GroupInstance) => {
        let group: IGroup = {
          GroupID: g.GroupID,
          Name: g.Name,
          FounderID: g.FounderID,
          OwnerRoleID: g.OwnerRoleID
        }
        return group;
      });
    });
  }

  getGroupByID(id: string): Promise<GroupInstance> {
    return this.groups.findOne({
      where: {
        GroupID: id
      }
    })
  }

  getRoles(): Promise<IRole[]> {
    return this.roles.findAll().then((roles: RoleInstance[]) => {
      return roles.map((r: IRole) => {
        let role: IRole = {
          Name: r.Name,
          Description: r.Description,
          Title: r.Title,
          GroupID: r.GroupID,
          RoleID: r.RoleID,
          Powers: r.Powers
        }
        return role;
      })
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

  getMembers(): Promise<IMembership[]> {
    return this.membership.findAll().then((members: MembershipInstance[]) => {
      return members.map((member: MembershipInstance) => {
        let mi: IMembership = {
          GroupID: member.GroupID,
          AgentID: member.AgentID,
          SelectedRoleID: member.SelectedRoleID
        }
        return mi;
      });
    });
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

}
