import { Action } from 'redux';
import { IMembership } from '../../../common/messages';
import { Record, Map, Set } from 'immutable';

interface MembershipAction extends Action {
  member: IMembership
}

interface MembershipBulkAction extends Action {
  members: IMembership[]
}

const ADD_MEMBER = "GROUPS_ADD_MEMBER";
const ADD_MEMBER_BULK = 'GROUPS_ADD_MEMBER_BULK';

export const UpsertMemberAction = function(m: IMembership): Action {
  let act: MembershipAction = {
    type: ADD_MEMBER,
    member: m
  }
  return act;
}

export const UpsertMemberBulkAction = function(m: IMembership[]): Action {
  let act: MembershipBulkAction = {
    type: ADD_MEMBER_BULK,
    members: m
  }
  return act;
}

export const MembersReducer = function(state = Map<string, Map<string, string>>(), action: Action): Map<string, Map<string, string>> {
  switch (action.type) {
    case ADD_MEMBER:
      let ma = <MembershipAction>action;
      let members = state.get(ma.member.GroupID, Map<string, string>());
      return state.set(ma.member.GroupID, members.set(ma.member.AgentID, ma.member.SelectedRoleID));
    case ADD_MEMBER_BULK:
      let mb = <MembershipBulkAction>action;
      mb.members.map( (m: IMembership) => {
        let members = state.get(m.GroupID, Map<string, string>());
        state = state.set(m.GroupID, members.set(m.AgentID, m.SelectedRoleID));
      });
      return state;
    default:
      return state;
  }
}