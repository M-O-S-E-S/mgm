import { Action } from 'redux';

export const APP_NAV_TO = "APP_NAV_TO";

interface Store {
  dispatch(action: NavigateTo): void
}

export interface NavigateTo extends Action {
  url: string
}

export function DispatchNav(store: Store, url: string): void {
  store.dispatch(<NavigateTo>{
    type: APP_NAV_TO,
    url: url
  });
}

export function NavReducer(state = "/", action: Action) {
  switch (action.type) {
    case APP_NAV_TO:
      let act = <NavigateTo>action;
      if (act.url === state) return state;
      return act.url
    default:
      return state;
  }
}