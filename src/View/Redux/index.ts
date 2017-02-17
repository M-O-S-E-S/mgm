import { createStore } from 'redux';

import { StateModel } from './model';
import reducer from "./RootReducer";

export { StateModel }

import { Region, Estate, Manager, EstateMap, Host, User, Group, Role, Member, Job, PendingUser } from '../Immutable';

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
    Update(user: User | User[]): void
    Destroy(user: User | User[] | string | string[]): void
  }
  Job: {
    Update(job: Job | Job[]): void
    Destroy(job: Job | Job[] | number | number[]): void
  }
  PendingUser: {
    Update(user: PendingUser | PendingUser[]): void
    Destroy(user: PendingUser | PendingUser[] | string | string[]): void
  }
  Group: {
    Update(group: Group | Group[]): void
    Destroy(group: Group | Group[] | string | string[]): void
    AddUser(group: Group, role: Role, user: User): void
    DestroyUser(group: Group, user: User): void
    AddMember(member: Member | Member[]): void
    DestroyMember(member: Member | Member[]): void
    AddRole(role: Role | Role[]): void
    DestroyRole(role: Role | Role[]): void
  }
  Region: {
    Destroy(region: Region | Region[] | string | string[]): void
    AssignEstate(region: Region, estate: number): void
    Update(region: Region | Region[]): void
  }
  Estate: {
    Update(estate: Estate | Estate[]): void
    Destroy(estate: Estate | Estate[] | number | number[]): void
    UpdateManager(manager: Manager | Manager[]): void
    DestroyManager(estate: Estate | number, manager: Manager | Manager[] | string | string[]): void
    UpdateMap(em: EstateMap | EstateMap[]): void
  }
  Host: {
    Destroy(host: Host | Host[] | number | number[]): void
    Update(host: Host | Host[]): void
  }
}

import { DispatchNav } from './reducers/nav';
import { DispatchLogin } from './reducers/auth';

export function getStore(): ReduxStore {
  let store = createStore<StateModel>(reducer);

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
      Update(job: Job | Job[]) { console.log('update job not implemented'); },
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