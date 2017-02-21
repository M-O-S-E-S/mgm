import { Action } from 'redux';
import { Member, Group } from '../../Immutable';
import { Record, Map, Set } from 'immutable';

const UPDATE_MEMBER = "GROUPS_UPDATE_MEMBER";
const DELETE_MEMBER = "GROUPS_DELETE_MEMBER";

interface Store {
  dispatch(action: UpdateMember | DeleteMember): void
}

interface UpdateMember extends Action {
  members: Member[]
}

interface DeleteMember extends Action {
  members: Member[]
}


export function DispatchUpdateMember(store: Store, m: Member | Member[]): void {
  if (!m) return;
  store.dispatch(<UpdateMember>{
    type: UPDATE_MEMBER,
    members: [].concat(m)
  });
}

export function DispatchDeleteMember(store: Store, m: Member | Member[]): void {
  if (!m) return;
  store.dispatch(<DeleteMember>{
    type: DELETE_MEMBER,
    members: [].concat(m)
  });
}

export function MemberReducer(state = Map<string, Map<string, Member>>(), action: Action): Map<string, Map<string, Member>> {
  switch (action.type) {
    case UPDATE_MEMBER:
      let update = <UpdateMember>action;
      update.members.map((m: Member) => {
        let members = state.get(m.GroupID, Map<string, Member>());
        let member = members.get(m.AgentID, new Member());
        member = member
          .set('AgentID', m.AgentID)
          .set('GroupID', m.GroupID)
          .set('SelectedRoleID', m.SelectedRoleID)
        members = members.set(m.AgentID, member);
        state = state.set(m.GroupID, members);
      })
      return state;
    case DELETE_MEMBER:
      let del = <DeleteMember>action;
      del.members.map((m: Member) => {
        let members = state.get(m.GroupID, Map<string, Member>());
        members = members.delete(m.AgentID);
        state = state.set(m.GroupID, members);
      });
      return state;
    default:
      return state;
  }
}