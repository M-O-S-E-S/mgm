import { Action } from 'redux';
import { StateModel, Auth } from '../model';
import { User } from '../../Immutable';

interface Store {
  dispatch(action: LoginAction | Action): void
}

const APP_LOGIN = "APP_LOGIN";
// export this one so the root reducer can use it to wipe state on logout
export const APP_LOGOUT = "APP_LOGOUT";
const APP_AUTH_ERROR = "APP_AUTH_ERROR";
const APP_CLEAR_AUTH_ERROR = "APP_CLEAR_AUTH_ERROR";

interface LoginAction extends Action {
  user: string
  token: string
  isAdmin: boolean
}

export function DispatchLogin(store: Store, uuid: string, isAdmin: boolean, token: string): void {
  store.dispatch(<LoginAction>{
    type: APP_LOGIN,
    user: uuid,
    isAdmin: isAdmin,
    token: token
  });
}

export function DispatchLogout(store: Store): void {
  store.dispatch({ type: APP_LOGOUT });
}

interface SetAuthMessage extends Action {
  message: string
}

export function DispatchSetAuthMessage(store: Store, msg: string): void {
  store.dispatch(<SetAuthMessage>{
    type: APP_AUTH_ERROR,
    message: msg
  });
}

export function DispatchClearAuthMessage(store: Store): void {
  store.dispatch({ type: APP_CLEAR_AUTH_ERROR });
}

export function AuthReducer(state = new Auth(), action: Action): Auth {
  switch (action.type) {
    case APP_LOGIN:
      let act = <LoginAction>action;
      return state
        .set('loggedIn', true)
        .set('errorMsg', '')
        .set('user', act.user)
        .set('isAdmin', act.isAdmin)
        .set('token', act.token);
    case APP_AUTH_ERROR:
      let aca = <SetAuthMessage>action;
      return state
        .set('loggedIn', false)
        .set('user', null)
        .set('token', null)
        .set('isAdmin', false)
        .set('errorMsg', aca.message);
    case APP_LOGOUT:
      //this is not handled here, but in Rootreducer, where the application state is wiped
      return state;
    default: return state;
  }
}