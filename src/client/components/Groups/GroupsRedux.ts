import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { IGroup, IMembership } from '../../../common/messages';


interface GroupAction extends Action {
  group: Group
}

const ADD_GROUP = 'GROUPS_ADD_GROUP';
const ADD_MEMBER = 'GROUPS_ADD_MEMBER';

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

export function UpsertGroupAction(g: Group): Action {
  let act: GroupAction = {
    type: ADD_GROUP,
    group: g
  }
  return act;
}

export const GroupsReducer = function (state = Map<string, Group>(), action: Action): Map<string, Group> {
  let gr: Group;
  switch (action.type) {
    case ADD_GROUP:
      let ga = <GroupAction>action;
      gr = state.get(ga.group.GroupID) || new Group()
      return state.set(
        ga.group.GroupID,
        gr.set('GroupID', ga.group.GroupID)
          .set('Name', ga.group.Name)
          .set('FounderID', ga.group.FounderID)
          .set('OwnerRoleID', ga.group.OwnerRoleID)
      );
    default:
      return state
  }
}