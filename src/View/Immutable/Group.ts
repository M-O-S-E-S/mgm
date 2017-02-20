import { Record } from 'immutable';
import { IGroup, IMember, IRole } from '../../Types';

const GroupClass = Record({
  GroupID: '',
  Name: '',
  FounderID: '',
  OwnerRoleID: ''
})

export class Group extends GroupClass implements IGroup {
  GroupID: string
  Name: string
  FounderID: string
  OwnerRoleID: string

  set(key: string, value: string): Group {
    return <Group>super.set(key, value);
  }
}

const MemberClass = Record({
  GroupID: '',
  AgentID: '',
  SelectedRoleID: ''
})

export class Member extends MemberClass implements IMember {
  GroupID: string
  AgentID: string
  SelectedRoleID: string

  set(key: string, value: string): Member {
    return <Member>super.set(key, value);
  }
}

const RoleClass = Record({
  GroupID: '',
  RoleID: '',
  Name: '',
  Description: '',
  Title: '',
  Powers: 0
})

export class Role extends RoleClass implements IRole {
  GroupID: string
  RoleID: string
  Name: string
  Description: string
  Title: string
  Powers: number

  set(key: string, value: string | number): Role {
    return <Role>super.set(key, value);
  }
}