import { Record } from 'immutable';
import { IRole } from '../../Store';

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