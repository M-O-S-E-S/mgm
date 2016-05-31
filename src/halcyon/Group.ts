
import { UUIDString } from './UUID';

export class Group {
  GroupID: UUIDString
  Name: string
  Charter: string
  InsigniaID: UUIDString
  FounderID: UUIDString
  MembershipFee: number
  OpenEnrollment: number
  ShowInList: number
  AllowPublish: number
  MaturePublish: number
  OwnerRoleID: UUIDString
  Members: GroupMembership[]
  Roles: GroupRole[]
}

export class GroupMembership {
  GroupID: UUIDString
  AgentID: UUIDString
  SelectedRoldeID: UUIDString
  Contribution: number
  ListInProfile: number
  AcceptNotices: number
}

export class GroupRole {
  GroupID: UUIDString
  RoleID: UUIDString
  Name: string
  Description: string
  Title: string
  Powers: number
}
