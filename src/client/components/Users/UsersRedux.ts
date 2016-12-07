import { Map, Record } from 'immutable';
import { IUser } from '../../../common/messages';
import { Action } from 'redux';

const UPSERT_USER = "USERS_UPSER_USER";

const UserClass = Record({
  uuid: '',
  name: '',
  email: '',
  godLevel: 0
})

export class User extends UserClass implements IUser {
  readonly uuid: string
  name: string
  email: string
  godLevel: number

  set(key: string, value: string | number): User {
    return <User>super.set(key, value);
  }
}

interface UpsertUser extends Action {
  user: User
}

export const UpsertUserAction = function(u: User): Action {
  let act: UpsertUser = {
    type: UPSERT_USER,
    user: u
  }
  return act;
}


export const UsersReducer = function(state = Map<string, User>(), action: Action): Map<string, User> {
  switch (action.type) {
    case UPSERT_USER:
      let act = <UpsertUser>action;
      return state.set(act.user.uuid, act.user);
    default:
      return state;
  }
}