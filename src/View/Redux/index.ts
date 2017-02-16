import { createStore, Store } from 'redux';

import { StateModel } from './model';
import reducer from "./reducer";

export { StateModel }

export interface ReduxStore {
  Subscribe(cb: () => void): void
  SyncStateWithserver(): void
  GetState(): StateModel
  NavigateTo(url: string): void
  Login(uuid: string, isAdmin: boolean, token: string): void
  Logout():void
  LoginError(message: string): void
}

export function getStore(): ReduxStore {
  let store = createStore<StateModel>(reducer);

  store.dispatch(createNavigateToAction());

  return {
    subscribe(cb: () => void) { store.subscribe(cb) },
    getState: store.getState,

  }
}