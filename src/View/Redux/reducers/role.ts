import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { Group, Role } from '../../Immutable';

const UPDATE_ROLE = "GROUPS_UPDATE_ROLE";
const DELETE_ROLE = 'GROUPS_DELETE_ROLE';

interface Store {
  dispatch(action: UpdateRole | DeleteRole): void
}

interface UpdateRole extends Action {
  roles: Role[]
}

interface DeleteRole extends Action {
  group: string
  roles: string[]
}

export function DispatchUpdateRole(store: Store, r: Role | Role[]): void {
  if (!r) return;
  store.dispatch(<UpdateRole>{
    type: UPDATE_ROLE,
    roles: [].concat(r)
  });
}

export function DispatchDeleteRole(store: Store, g: Group | string, r: Role | Role[] | string | string[]): void {
  if (!g || !r) return;
  let group: string;
  if (typeof (g) === 'string') {
    group = g;
  } else {
    group = g.GroupID;
  }
  let roles = [].concat(r);
  if (typeof (roles[0]) === 'string') {
    store.dispatch(<DeleteRole>{
      type: DELETE_ROLE,
      roles: roles
    });
  } else {
    store.dispatch(<DeleteRole>{
      type: DELETE_ROLE,
      roles: roles.map((r: Role) => { return r.RoleID })
    });
  }
}

export function RoleReducer(state = Map<string, Map<string, Role>>(), action: Action): Map<string, Map<string, Role>> {
  switch (action.type) {
    case UPDATE_ROLE:
      let update = <UpdateRole>action;
      update.roles.map((r: Role) => {
        let roles = state.get(r.GroupID, Map<string, Role>());
        let role = roles.get(r.RoleID, new Role());
        role = role.set('GroupID', r.GroupID)
          .set('RoleID', r.RoleID)
          .set('Name', r.Name)
          .set('Description', r.Description)
          .set('Title', r.Title)
          .set('Powers', r.Powers)
        roles = roles.set(r.RoleID, role);
        state = state.set(r.GroupID, roles);
      })
      return state;
    case DELETE_ROLE:
      let del = <DeleteRole>action;
      let roles = state.get(del.group);
      del.roles.map((r) => {
        roles = roles.delete(r);
      });
      return state.set(del.group, roles);
    default:
      return state
  }
}