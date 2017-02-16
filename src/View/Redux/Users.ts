import { Map, Record } from 'immutable';
import { Action } from 'redux';

import { User } from '../Immutable';

const UPSERT_USER = "USERS_UPSERT_USER";
const UPSERT_USER_BULK = "USERS_UPSERT_USER_BULK";
const DELETE_USER = "USERS_DELETE_USER";
const DELETE_USER_BULK = "USERS_DELETE_USER_BULK";

interface UserAction extends Action {
  user: User
}

interface UpsertUserBulk extends Action {
  users: User[]
}

interface DeleteUserBulk extends Action {
  users: string[]
}

export const UpsertUserAction = function (u: User): Action {
  let act: UserAction = {
    type: UPSERT_USER,
    user: u
  }
  return act;
}

export const UpsertUserBulkAction = function (u: User[]): Action {
  let act: UpsertUserBulk = {
    type: UPSERT_USER_BULK,
    users: u
  }
  return act;
}

export const DeleteUser = function (u: User): Action {
  let act: UserAction = {
    type: DELETE_USER,
    user: u
  }
  return act;
}

export const DeleteUserBulkAction = function (u: string[]): Action {
  let act: DeleteUserBulk = {
    type: DELETE_USER_BULK,
    users: u
  }
  return act;
}

function upsertUser(state: Map<string, User>, u: User): Map<string, User> {
  let rec = state.get(u.UUID) || new User();
  return state.set(
    u.UUID,
    rec.set('UUID', u.UUID)
      .set('username', u.username)
      .set('lastname', u.lastname)
      .set('email', u.email)
      .set('godLevel', u.godLevel)
  );
}

export const UsersReducer = function (state = Map<string, User>(), action: Action): Map<string, User> {
  switch (action.type) {
    case UPSERT_USER:
      let act = <UserAction>action;
      return upsertUser(state, act.user);
    case UPSERT_USER_BULK:
      let uub = <UpsertUserBulk>action;
      uub.users.map((u: User) => {
        state = upsertUser(state, u);
      })
      return state;
    case DELETE_USER:
      act = <UserAction>action;
      return state.delete(act.user.UUID);
    case DELETE_USER_BULK:
      let db = <DeleteUserBulk>action;
      db.users.map((u) => {
        state = state.delete(u);
      });
      return state;
    default:
      return state;
  }
}