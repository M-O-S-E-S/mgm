import { Map, Record } from 'immutable';
import { IUser } from '../../../common/messages';
import { Action } from 'redux';

const UPSERT_USER = "USERS_UPSERT_USER";
const UPSERT_USER_BULK = "USERS_UPSERT_USER_BULK";
const DELETE_USER = "USERS_DELETE_USER";

const UserClass = Record({
  uuid: '',
  name: '',
  email: '',
  godLevel: 0
})

export class User extends UserClass implements IUser {
  readonly uuid: string
  readonly name: string
  readonly email: string
  readonly godLevel: number

  set(key: string, value: string | number): User {
    return <User>super.set(key, value);
  }
}

interface UserAction extends Action {
  user: User
}

interface UpsertUserBulk extends Action {
  users: User[]
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

export const DeleteUser = function(u: User): Action {
  let act: UserAction = {
    type: DELETE_USER,
    user: u
  }
  return act;
}

function upsertUser(state: Map<string, User>, u: User): Map<string, User> {
  let rec = state.get(u.uuid) || new User();
  return state.set(
    u.uuid,
    rec.set('uuid', u.uuid)
      .set('name', u.name)
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
      return state.delete(act.user.uuid);
    default:
      return state;
  }
}