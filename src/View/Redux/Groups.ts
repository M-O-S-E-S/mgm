import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { Group } from '../Immutable';

interface GroupAction extends Action {
  group: Group
}

interface GroupBulkAction extends Action {
  groups: Group[];
}

interface DeleteGroupBulkAction extends Action {
  groups: string[]
}

const ADD_GROUP = 'GROUPS_ADD_GROUP';
const ADD_GROUP_BULK = 'GROUPS_ADD_GROUP_BULK';
const DELETE_GROUP_BULK = 'GROUPS_DELETE_GROUP_BULK';

export function UpsertGroupAction(g: Group): Action {
  let act: GroupAction = {
    type: ADD_GROUP,
    group: g
  }
  return act;
}

export function UpsertGroupBulkAction(g: Group[]): Action {
  let act: GroupBulkAction = {
    type: ADD_GROUP_BULK,
    groups: g
  }
  return act;
}

export function DeleteGroupBulkAction(g: string[]): Action {
  let act: DeleteGroupBulkAction = {
    type: DELETE_GROUP_BULK,
    groups: g
  }
  return act;
}

function upsertGroup(state: Map<string, Group>, g: Group): Map<string, Group> {
  let group = state.get(g.GroupID, new Group());
  group = group.set('GroupID', g.GroupID)
    .set('Name', g.Name)
    .set('FounderID', g.FounderID)
    .set('OwnerRoleID', g.OwnerRoleID)
  return state.set(g.GroupID, group);
}

export const GroupsReducer = function (state = Map<string, Group>(), action: Action): Map<string, Group> {
  let gr: Group;
  switch (action.type) {
    case ADD_GROUP:
      let ga = <GroupAction>action;
      return upsertGroup(state, ga.group);
    case ADD_GROUP_BULK:
      let gb = <GroupBulkAction>action;
      gb.groups.map((g: Group) => {
        state = upsertGroup(state, g);
      })
      return state;
    case DELETE_GROUP_BULK:
      let db = <DeleteGroupBulkAction>action;
      db.groups.map((g) => {
        state = state.delete(g);
      });
      return state;
    default:
      return state
  }
}