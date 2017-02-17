import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { Group } from '../../Immutable';

const UPDATE_GROUP = 'GROUPS_ADD_GROUP';
const DELETE_GROUP = 'GROUPS_DELETE_GROUP';

interface Store {
  dispatch(action: UpdateGroup | DeleteGroup): void
}

interface UpdateGroup extends Action {
  groups: Group[]
}

interface DeleteGroup extends Action {
  groups: string[]
}

export function DispatchUpdateGroup(store: Store, g: Group | Group[]): void {
  if (!g) return;
  store.dispatch(<UpdateGroup>{
    type: UPDATE_GROUP,
    groups: [].concat(g)
  });
}

export function DispatchDeleteGroup(store: Store, g: Group | Group[] | string | string[]): void {
  if (!g) return;
  let groups = [].concat(g);
  if (typeof (groups[0]) === "string") {
    store.dispatch(<DeleteGroup>{
      type: DELETE_GROUP,
      groups: groups
    });
  } else {
    store.dispatch(<DeleteGroup>{
      type: DELETE_GROUP,
      groups: groups.map((g: Group) => { return g.GroupID })
    });
  }
}

export const GroupsReducer = function (state = Map<string, Group>(), action: Action): Map<string, Group> {
  let gr: Group;
  switch (action.type) {
    case UPDATE_GROUP:
      let update = <UpdateGroup>action;
      update.groups.map((g: Group) => {
        let group = state.get(g.GroupID, new Group());
        group = group.set('GroupID', g.GroupID)
          .set('Name', g.Name)
          .set('FounderID', g.FounderID)
          .set('OwnerRoleID', g.OwnerRoleID)
        state = state.set(g.GroupID, group);
      });
      return state;
    case DELETE_GROUP:
      let del = <DeleteGroup>action;
      del.groups.map((g) => {
        state = state.delete(g);
      });
      return state;
    default:
      return state
  }
}