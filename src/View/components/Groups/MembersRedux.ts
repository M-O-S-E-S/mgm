import { Action } from 'redux';
import { IMembership } from '../../../common/messages';
import { Record, Map, Set } from 'immutable';

interface MembershipAction extends Action {
  member: IMembership
}

interface MembershipBulkAction extends Action {
  members: IMembership[]
}

interface DeleteMembershipBulkAction extends Action {
  group: string,
  members: string[]
}

const ADD_MEMBER = "GROUPS_ADD_MEMBER";
const ADD_MEMBER_BULK = 'GROUPS_ADD_MEMBER_BULK';
const DELETE_MEMBER = "GROUPS_DELETE_MEMBER";
const DELETE_MEMBER_BULK = 'GROUPS_DELETE_MEMBER_BULK';

export const UpsertMemberAction = function (m: IMembership): Action {
  let act: MembershipAction = {
    type: ADD_MEMBER,
    member: m
  }
  return act;
}

export const DeleteMemberAction = function (m: IMembership): Action {
  let act: MembershipAction = {
    type: DELETE_MEMBER,
    member: m
  }
  return act;
}

export const UpsertMemberBulkAction = function (m: IMembership[]): Action {
  let act: MembershipBulkAction = {
    type: ADD_MEMBER_BULK,
    members: m
  }
  return act;
}

export const DeleteMemberBulkAction = function (group: string, members: string[]): Action {
  let act: DeleteMembershipBulkAction = {
    type: DELETE_MEMBER_BULK,
    group: group,
    members: members
  }
  return act;
}

export const MembersReducer = function (state = Map<string, Map<string, string>>(), action: Action): Map<string, Map<string, string>> {
  switch (action.type) {
    case ADD_MEMBER:
      let ma = <MembershipAction>action;
      let members = state.get(ma.member.GroupID, Map<string, string>());
      return state.set(ma.member.GroupID, members.set(ma.member.AgentID, ma.member.SelectedRoleID));
    case ADD_MEMBER_BULK:
      let mb = <MembershipBulkAction>action;
      mb.members.map((m: IMembership) => {
        let members = state.get(m.GroupID, Map<string, string>());
        state = state.set(m.GroupID, members.set(m.AgentID, m.SelectedRoleID));
      });
      return state;
    case DELETE_MEMBER:
      ma = <MembershipAction>action;
      members = state.get(ma.member.GroupID, Map<string, string>());
      return state.set(ma.member.GroupID, members.delete(ma.member.AgentID));
    case DELETE_MEMBER_BULK:
      let db = <DeleteMembershipBulkAction>action;
      members = state.get(db.group);
      db.members.map((m) => {
        members = members.delete(m);
      });
      return state.set(db.group, members);
    default:
      return state;
  }
}