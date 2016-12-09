import { Action } from 'redux';
import { IMembership } from '../../../common/messages';
import { Record, Map, Set } from 'immutable';

interface MembershipAction extends Action {
  member: IMembership
}

const ADD_MEMBER = "GROUPS_ADD_MEMBER";

export const UpsertMemberAction = function(m: IMembership): Action {
  let act: MembershipAction = {
    type: ADD_MEMBER,
    member: m
  }
  return act;
}

export const MembersReducer = function(state = Map<string, Set<string>>(), action: Action): Map<string, Set<string>> {
  switch (action.type) {
    case ADD_MEMBER:
      let ma = <MembershipAction>action;
      let members = state.get(ma.member.GroupID) || Set<string>();
      return state.set(ma.member.GroupID, members.add(ma.member.AgentID));
    default:
      return state
  }
}