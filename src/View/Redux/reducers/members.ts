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
  group: string
  members: string[]
}


export function DispatchUpdateMember(store: Store, m: Member | Member[]): void {
  if (!m) return;
  store.dispatch(<UpdateMember>{
    type: UPDATE_MEMBER,
    members: [].concat(m)
  });
}

export function DispatchDeleteMember(store: Store, g: Group | string, m: Member | Member[] | string | string[]): Action {
  if (!g || !m) return;
  let group: string
  if (typeof (g) === "string") {
    group = g;
  } else {
    group = g.GroupID;
  }
  let members = [].concat(m);
  if (typeof (members[0]) === "string") {
    store.dispatch(<DeleteMember>{
      type: DELETE_MEMBER,
      members: members
    });
  } else {
    store.dispatch(<DeleteMember>{
      type: DELETE_MEMBER,
      members: members.map((m: Member) => { return m.AgentID; })
    });
  }
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
      let members = state.get(del.group, Map<string, Member>());
      del.members.map((m: string) => {
        members = members.delete(m);
      });
      return state.set(del.group, members);
    default:
      return state;
  }
}