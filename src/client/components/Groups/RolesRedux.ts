import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { IRole } from '../../../common/messages';

interface RoleAction extends Action {
  role: Role
}

const ADD_ROLE = "GROUPS_ADD_ROLE";

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

  set(key: string, value: string): Role {
    return <Role>super.set(key, value);
  }
}

export const UpsertRoleAction = function(r: Role): Action {
  let act: RoleAction = {
    type: ADD_ROLE,
    role: r
  }
  return act;
}

export const RolesReducer = function(state = Map<string, Map<string, Role>>(), action: Action): Map<string, Map<string, Role>> {
  switch (action.type) {
    case ADD_ROLE:
      let ra = <RoleAction>action;
      let roles = state.get(ra.role.GroupID) || Map<string, Role>();
      return state.set(ra.role.GroupID, roles.set(ra.role.RoleID, ra.role))
    default:
      return state
  }
}