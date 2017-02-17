import { createStore } from 'redux';

import { StateModel } from './model';
import reducer from "./RootReducer";

export { StateModel }

import { Region, Estate, Host, User, Group, Role, Job, PendingUser } from '../Immutable';

export interface ReduxStore {
  Subscribe(cb: () => void): void
  SyncStateWithserver(): void
  GetState(): StateModel
  NavigateTo(url: string): void
  Auth: {
    Login(uuid: string, isAdmin: boolean, token: string): void
    Logout(): void
    LoginError(message: string): void
  }
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

import { DispatchNav } from './reducers/nav';
import { DispatchLogin } from './reducers/auth';

export function getStore(): ReduxStore {
  let store = createStore<StateModel>(reducer);

  //store.dispatch(createNavigateToAction());

  return {
    Subscribe: store.subscribe,
    SyncStateWithserver() { console.log('Sync State not implemented'); },
    GetState: store.getState,
    NavigateTo: DispatchNav.bind(null, store),
    Auth: {
      Login: DispatchLogin.bind(null, store),
      Logout() { console.log('logout not implemented'); },
      LoginError(msg: string) { console.log('login error not implemented'); },
    },
    User: {
      Update(user: User) { console.log('update user not implemented'); },
      Destroy(user: User) { console.log('destroy user not implemented'); },
    },
    Job: {
      Update(job: Job) { console.log('update job not implemented'); },
      Destroy(job: Job) { console.log('destroy job not implemented'); },
    },
    PendingUser: {
      Destroy(user: PendingUser) { console.log('pending user destroy not implemented'); }
    },
    Group: {
      AddUser(group: Group, role: Role, user: User) { console.log('group adduser not implemented'); },
      DeleteUser(group: Group, user: User) { console.log('group deleteuser not implemented'); }
    },
    Region: {
      Destroy(region: Region) { console.log('region destroy not implemented'); },
      AssignEstate(region: Region, estate: number) { console.log('region assign estate not implemented'); },
      Update(region: Region) { console.log('region update not implemented'); },
    },
    Estate: {
      Destroy(estate: Estate) { console.log('estate destroy not implemented'); },
      Update(estate: Estate) { console.log('estate update not implemented'); },
    },
    Host: {
      Destroy(host: Host) { console.log('host destroy not implemented'); },
      Update(host: Host) { console.log('host update not implemented'); },
    }
  }
}