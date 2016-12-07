import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { IGroup } from '../../../common/messages';


export interface GroupAction extends Action {
  group: Group
}

const ADD_GROUP = 'GROUPS_ADD_GROUP';

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

export function CreateGroupAction(g: Group): Action {
  let act: GroupAction = {
    type: ADD_GROUP,
    group: g
  }
  return act;
}

export const GroupsReducer = function(state = Map<string, Group>(), action: Action): Map<string, Group> {
  let gr: Group;
  switch (action.type) {
    case ADD_GROUP:
      let ga = <GroupAction>action;
      gr = state.get(ga.group.GroupID) || ga.group
      return state.set(ga.group.GroupID, gr);
    default:
      return state
  }
}