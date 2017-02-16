import { createStore, Store } from 'redux';

import { StateModel } from './model';
import reducer from "./reducer";

export { StateModel }

import { Region, Estate, Host, User, Group, Role, Job, PendingUser } from '../Immutable';

export interface ReduxStore {
  Subscribe(cb: () => void): void
  SyncStateWithserver(): void
  GetState(): StateModel
  NavigateTo(url: string): void
  Login(uuid: string, isAdmin: boolean, token: string): void
  Logout(): void
  LoginError(message: string): void
  User: {
    Update(user: User): void
    Destroy(user: User): void
  }
  Job: {
    Update(job: Job): void
    Destroy(job: Job): void
  }
  PendingUser: {
    Destroy(user: PendingUser): void
  }
  Group: {
    AddUser(group: Group, role: Role, user: User): void
    DeleteUser(group: Group, user: User): void
  }
  Region: {
    Destroy(region: Region): void
    AssignEstate(region: Region, estate: number): void
    Update(region: Region): void
  }
  Estate: {
    Destroy(estate: Estate): void
    Update(estate: Estate): void
  }
  Host: {
    Destroy(host: Host): void
    Update(host: Host): void
  }
}

export function getStore(): ReduxStore {
  let store = createStore<StateModel>(reducer);

  //store.dispatch(createNavigateToAction());

  return {
    //  subscribe(cb: () => void) { store.subscribe(cb) },
    //  getState: store.getState,

  }
}