import { Map, Record } from 'immutable';
import { Action } from 'redux';

import { User } from '../../Immutable';

const UPDATE_USER = "USERS_UPDATE_USER";
const DELETE_USER = "USERS_DELETE_USER";

interface Store {
  dispatch(action: UpdateUser | DeleteUser): void
}

interface UpdateUser extends Action {
  users: User[]
}

interface DeleteUser extends Action {
  users: string[]
}

export function DispatchUpdateUser(store: Store, u: User | User[]): void {
  if (!u) return;
  store.dispatch(<UpdateUser>{
    type: UPDATE_USER,
    users: [].concat(u)
  })
}

export function DispatchDeleteUser(store: Store, u: string | string[] | User | User[]): void {
  if (!u) return;
  let users = [].concat(u);
  if (typeof (users[0]) === "string") {
    store.dispatch(<DeleteUser>{
      type: DELETE_USER,
      users: users
    });
  } else {
    store.dispatch(<DeleteUser>{
      type: DELETE_USER,
      users: users.map((u: User) => { return u.UUID; })
    });
  }
}

export function UsersReducer(state = Map<string, User>(), action: Action): Map<string, User> {
  switch (action.type) {
    case UPDATE_USER:
      let update = <UpdateUser>action;
      update.users.map((u: User) => {
        let rec = state.get(u.UUID) || new User();
        state = state.set(
          u.UUID,
          rec.set('UUID', u.UUID)
            .set('username', u.username)
            .set('lastname', u.lastname)
            .set('email', u.email)
            .set('godLevel', u.godLevel)
        );
      });
      return state;
    case DELETE_USER:
      let del = <DeleteUser>action;
      del.users.map((u) => {
        state = state.delete(u);
      });
      return state;
    default:
      return state;
  }
}