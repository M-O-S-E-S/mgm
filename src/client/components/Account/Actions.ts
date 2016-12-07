import { Action } from 'redux';

const SET_MY_PASSWORD = 'SET_MY_PASSWORD';

export interface MyPasswordAction extends Action {
  password: string
}

export function createSetMyPasswordAction(password: string): Action {
  let act: MyPasswordAction = {
    type: SET_MY_PASSWORD,
    password: password
  }
  return act;
}