import { Action } from 'redux';

import { User } from '../Immutable';


export const APP_NAV_TO = "APP_NAV_TO";


export interface NavigateTo extends Action {
  url: string
}

export function createNavigateToAction(url: string): Action {
  let act: NavigateTo = {
    type: APP_NAV_TO,
    url: url
  }
  return act;
}