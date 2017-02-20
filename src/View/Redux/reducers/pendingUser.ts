import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { PendingUser } from '../Immutable';

const UPSERT_USER = "PENDINGUSERS_UPSERT_USER";
const DELETE_USER = "PENDINGUSERS_DELETE_USER";

interface PendingUserAction extends Action {
  user: PendingUser
}

export const UpsertPendingUserAction = function (u: PendingUser): Action {
  let act: PendingUserAction = {
    type: UPSERT_USER,
    user: u
  }
  return act;
}

export const DeletePendingUserAction = function (u: PendingUser): Action {
  let act: PendingUserAction = {
    type: DELETE_USER,
    user: u
  }
  return act;
}

export const PendingUsersReducer = function (state = Map<string, PendingUser>(), action: Action): Map<string, PendingUser> {
  switch (action.type) {
    case UPSERT_USER:
      let act = <PendingUserAction>action;
      return state.set(act.user.name, act.user);
    case DELETE_USER:
      act = <PendingUserAction>action;
      return state.delete(act.user.name)
    default:
      return state;
  }
}