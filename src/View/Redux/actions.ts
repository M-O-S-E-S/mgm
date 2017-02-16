import { Action } from 'redux';

import { User } from '../Immutable';

export const APP_LOGIN = "APP_LOGIN";
export const APP_LOGOUT = "APP_LOGOUT";
export const APP_AUTH_ERROR = "APP_AUTH_ERROR";
export const APP_CLEAR_AUTH_ERROR = "APP_CLEAR_AUTH_ERROR";
export const APP_NAV_TO = "APP_NAV_TO";
export const APP_CHANGE_PASSWORD = "APP_CHANGE_PASSWORD";


export interface LoginAction extends Action {
  user: string
  token: string
  isAdmin: boolean
}

export interface MyPasswordAction extends Action {
  password: string
}

export interface SetAuthMessage extends Action {
  message: string
}

export interface NavigateTo extends Action {
  url: string
}

export function createLoginAction(user: string, isAdmin: boolean, token: string): Action {
  let act: LoginAction = {
    type: APP_LOGIN,
    user: user,
    token: token,
    isAdmin: isAdmin
  }
  return act;
}

export function createLogoutAction(): Action {
  return { type: APP_LOGOUT };
}

export function createSetAuthErrorMessageAction(msg: string): Action {
  let act: SetAuthMessage = {
    type: APP_AUTH_ERROR,
    message: msg
  }
  return act;
}

export function createClearAuthErrorMessageAction(): Action {
  return { type: APP_CLEAR_AUTH_ERROR };
}

export function createNavigateToAction(url: string): Action {
  let act: NavigateTo = {
    type: APP_NAV_TO,
    url: url
  }
  return act;
}