import { createStore } from 'redux';

import { StateModel } from './model';
import reducer from "./RootReducer";

export { StateModel }

import { Region, Estate, Manager, EstateMap, Host, User, Group, Role, Member, Job, PendingUser } from '../Immutable';

export interface ReduxStore {
  Subscribe(cb: () => void): void
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
  }
  Manager: {
    Update(manager: Manager | Manager[]): void
    Destroy(estate: Estate | number, manager: Manager | Manager[] | string | string[]): void
  }
  EstateMap: {
    Update(em: EstateMap | EstateMap[]): void
  }
  Host: {
    Destroy(host: Host | Host[] | number | number[]): void
    Update(host: Host | Host[]): void
  }
}

import { DispatchNav } from './reducers/nav';
import { DispatchLogin } from './reducers/auth';
import { DispatchUpdateJob, DispatchDestroyJob } from './reducers/job';
import { DispatchUpdateRegion, DispatchDeleteRegion } from './reducers/region';
import { DispatchUpdateHost, DispatchDeleteHost } from './reducers/host';
import { DispatchUpdateEstate, DispatchDeleteEstate } from './reducers/estate';
import { DispatchUpdateManager, DispatchDeleteManager } from './reducers/manager';

export { Synchronizer } from './Synchronizer';

export function getStore(): ReduxStore {
  let store = createStore<StateModel>(reducer);

  return {
    Subscribe: store.subscribe,
    GetState: store.getState,
    NavigateTo: DispatchNav.bind(null, store),
    Auth: {
      Login: DispatchLogin.bind(null, store),
      Logout() { console.log('logout not implemented'); },
      LoginError(msg: string) { console.log('login error not implemented'); },
    },
    User: {
      Update(user: User | User[]) { console.log('update user not implemented'); },
      Destroy(user: User | User[] | string | string[]) { console.log('destroy user not implemented'); },
    },
    Job: {
      Update: DispatchUpdateJob.bind(null, store),
      Destroy: DispatchDestroyJob.bind(null, store)
    },
    PendingUser: {
      Update(user: PendingUser | PendingUser[]) { console.log('pending user update not implemented'); },
      Destroy(user: PendingUser | PendingUser[] | string | string[]) { console.log('pending user destroy not implemented'); }
    },
    Group: {
      Update(group: Group | Group[]) { console.log('group update not implemented'); },
      Destroy(group: Group | Group[] | string | string[]) { console.log('group destroy not implemented'); },
      AddUser(group: Group, role: Role, user: User) { console.log('group add user not implemented'); },
      DestroyUser(group: Group, user: User) { console.log('group destroy user not implemented'); },
      AddMember(member: Member | Member[]) { console.log('group add member not implemented'); },
      DestroyMember(member: Member | Member[]) { console.log('group destroy member not implemented'); },
      AddRole(role: Role | Role[]) { console.log('groupt add role not implemented'); },
      DestroyRole(role: Role | Role[]) { console.log('groupt destroy role not implemented'); }
    },
    Region: {
      Update: DispatchUpdateRegion.bind(null, store),
      AssignEstate(region: Region, estate: number) { console.log('region assign estate not implemented'); },
      Destroy: DispatchDeleteRegion.bind(null, store),
    },
    Estate: {
      Update: DispatchUpdateEstate.bind(null, store),
      Destroy: DispatchDeleteEstate.bind(null, store),
    },
    Manager: {
      Update: DispatchUpdateManager.bind(null, store),
      Destroy: DispatchDeleteManager.bind(null, store),
    },
    EstateMap: {
      Update(em: EstateMap | EstateMap[]) { console.log('estate update map not implemented'); }
    },
    Host: {
      Update: DispatchUpdateHost.bind(null, store),
      Destroy: DispatchDeleteHost.bind(null, store)
    }
  }
}