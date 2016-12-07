import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { IPendingUser } from '../../../common/messages';

const UPSERT_USER = "PENDINGUSERS_UPSERT_USER";

const PendingUserClass = Record({
  name: '',
  email: '',
  gender: '',
  registered: Date,
  summary: ''
})

interface InsertPendingUser extends Action {
  user: PendingUser
}

export class PendingUser extends PendingUserClass implements IPendingUser {
  name: string
  email: string
  gender: string
  registered: Date
  summary: string

  set(key: string, value: string): PendingUser {
    return <PendingUser>super.set(key, value);
  }
}

export const UpsertPendingUserAction = function(u: PendingUser): Action {
  let act: InsertPendingUser = {
    type: UPSERT_USER,
    user: u
  }
  return act;
}

export const PendingUsersReducer = function(state = Map<string, PendingUser>(), action: Action): Map<string, PendingUser> {
  switch (action.type) {
    case UPSERT_USER:
      let act = <InsertPendingUser>action;
      return state.set(act.user.name, act.user);
    default:
      return state;
  }
}