import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { PendingUser } from '../../Immutable';

const UPDATE_USER = "PENDINGUSERS_UPDATE_USER";
const DELETE_USER = "PENDINGUSERS_DELETE_USER";

interface Store {
  dispatch(action: UpdatePendingUser | DeletePendingUser): void
}

interface UpdatePendingUser extends Action {
  users: PendingUser[]
}

interface DeletePendingUser extends Action {
  users: string[]
}

export function DispatchUpdatePendingUser(store: Store, u: PendingUser | PendingUser[]): void {
  if (!u) return;
  store.dispatch(<UpdatePendingUser>{
    type: UPDATE_USER,
    users: [].concat(u)
  });
}

export function DispatchDeletePendingUser(store: Store, u: PendingUser | PendingUser[] | string | string[]): void {
  if (!u) return;
  let users = [].concat(u);
  if (typeof (users[0] === 'string')) {
    store.dispatch(<DeletePendingUser>{
      type: DELETE_USER,
      users: users
    });
  } else {
    store.dispatch(<DeletePendingUser>{
      type: DELETE_USER,
      users: users.map((u: PendingUser) => { return u.name; })
    });
  }
}

export function PendingUserReducer(state = Map<string, PendingUser>(), action: Action): Map<string, PendingUser> {
  switch (action.type) {
    case UPDATE_USER:
      let act = <UpdatePendingUser>action;
      act.users.map((u: PendingUser) => {
        let user = state.get(u.name, new PendingUser());
        user = user
          .set('name', u.name)
          .set('email', u.email)
          .set('gender', u.gender)
          .set('registered', u.registered)
          .set('summary', u.summary);
        state = state.set(u.name, user);
      });
      return state;
    case DELETE_USER:
      let del = <DeletePendingUser>action;
      del.users.map((u: string) => {
        state = state.delete(u);
      })
      return state;
    default:
      return state;
  }
}
