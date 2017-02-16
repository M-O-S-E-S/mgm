import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { Role } from '../../Immutable';

interface RoleAction extends Action {
  role: Role
}

interface RoleBulkAction extends Action {
  roles: Role[]
}

interface DeleteRoleBulkaction extends Action {
  group: string
  roles: string[]
}

const ADD_ROLE = "GROUPS_ADD_ROLE";
const ADD_ROLE_BULK = "GROUPS_ADD_ROLE_BULK";
const DELETE_ROLE_BULK = 'GROUPS_DELETE_ROLE_BULK';

export const UpsertRoleAction = function (r: Role): Action {
  let act: RoleAction = {
    type: ADD_ROLE,
    role: r
  }
  return act;
}

export const UpsertRoleBulkAction = function (r: Role[]): Action {
  let act: RoleBulkAction = {
    type: ADD_ROLE_BULK,
    roles: r
  }
  return act;
}

export const DeleteRoleBulkAction = function (group: string, roles: string[]): Action {
  let act: DeleteRoleBulkaction = {
    type: DELETE_ROLE_BULK,
    group: group,
    roles: roles
  }
  return act;
}

function upsertRole(state: Map<string, Map<string, Role>>, r: Role): Map<string, Map<string, Role>> {
  let roles = state.get(r.GroupID, Map<string, Role>());
  let role = roles.get(r.RoleID, new Role());
  role = role.set('GroupID', r.GroupID)
    .set('RoleID', r.RoleID)
    .set('Name', r.Name)
    .set('Description', r.Description)
    .set('Title', r.Title)
    .set('Powers', r.Powers)
  roles = roles.set(r.RoleID, role);
  return state.set(r.GroupID, roles);
}

export const RolesReducer = function (state = Map<string, Map<string, Role>>(), action: Action): Map<string, Map<string, Role>> {
  switch (action.type) {
    case ADD_ROLE:
      let ra = <RoleAction>action;
      return upsertRole(state, ra.role);
    case ADD_ROLE_BULK:
      let rb = <RoleBulkAction>action;
      rb.roles.map((r: Role) => {
        state = upsertRole(state, r);
      })
      return state;
    case DELETE_ROLE_BULK:
      let db = <DeleteRoleBulkaction>action;
      let roles = state.get(db.group);
      db.roles.map((r) => {
        roles = roles.delete(r);
      });
      return state.set(db.group, roles);
    default:
      return state
  }
}