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

export const MembersReducer = function(state = Map<string, Set<string>>(), action: Action): Map<string, Set<string>> {
  switch (action.type) {
    case ADD_MEMBER:
      let ma = <MembershipAction>action;
      let members = state.get(ma.member.GroupID, Set<string>());
      return state.set(ma.member.GroupID, members.add(ma.member.AgentID));
    case ADD_MEMBER_BULK:
      let mb = <MembershipBulkAction>action;
      mb.members.map( (m: IMembership) => {
        let members = state.get(m.GroupID, Set<string>());
        state = state.set(m.GroupID, members.add(m.AgentID));
      });
      return state;
    default:
      return state;
  }
}