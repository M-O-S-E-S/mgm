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
    Error(message: string): void
    ClearError(): void
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
    AddMember(member: Member | Member[]): void
    DestroyMember(m: Member | Member[] | string | string[]): void
    AddRole(role: Role | Role[]): void
    DestroyRole(role: Role | Role[]): void
  }
  Region: {
    Destroy(region: Region | Region[] | string | string[]): void
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
import { DispatchLogin, DispatchLogout, DispatchSetAuthMessage, DispatchClearAuthMessage } from './reducers/auth';
import { DispatchUpdateJob, DispatchDestroyJob } from './reducers/job';
import { DispatchUpdateRegion, DispatchDeleteRegion } from './reducers/region';
import { DispatchUpdateHost, DispatchDeleteHost } from './reducers/host';
import { DispatchUpdateEstate, DispatchDeleteEstate } from './reducers/estate';
import { DispatchUpdateManager, DispatchDeleteManager } from './reducers/manager';
import { DispatchAssignEstateMap } from './reducers/estateMap';
import { DispatchUpdateGroup, DispatchDeleteGroup } from './reducers/group';
import { DispatchUpdateUser, DispatchDeleteUser } from './reducers/user';
import { DispatchUpdatePendingUser, DispatchDeletePendingUser } from './reducers/pendingUser';
import { DispatchUpdateMember, DispatchDeleteMember } from './reducers/members';
import { DispatchUpdateRole, DispatchDeleteRole } from './reducers/role';

export { Synchronizer, ResumeSession } from './Synchronizer';

export function getStore(): ReduxStore {
  let store = createStore<StateModel>(reducer);

  return {
    Subscribe: store.subscribe,
    GetState: store.getState,
    NavigateTo: DispatchNav.bind(null, store),
    Auth: {
      Login: DispatchLogin.bind(null, store),
      Logout: DispatchLogout.bind(null, store),
      Error: DispatchSetAuthMessage.bind(null, store),
      ClearError: DispatchClearAuthMessage.bind(null, store)
    },
    User: {
      Update: DispatchUpdateUser.bind(null, store),
      Destroy: DispatchDeleteUser.bind(null, store),
    },
    Job: {
      Update: DispatchUpdateJob.bind(null, store),
      Destroy: DispatchDestroyJob.bind(null, store)
    },
    PendingUser: {
      Update: DispatchUpdatePendingUser.bind(null, store),
      Destroy: DispatchDeletePendingUser.bind(null, store)
    },
    Group: {
      Update: DispatchUpdateGroup.bind(null, store),
      Destroy: DispatchDeleteGroup.bind(null, store),
      AddMember: DispatchUpdateMember.bind(null, store),
      DestroyMember: DispatchDeleteMember.bind(null, store),
      AddRole: DispatchUpdateRole.bind(null, store),
      DestroyRole: DispatchDeleteRole.bind(null, store)
    },
    Region: {
      Update: DispatchUpdateRegion.bind(null, store),
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
      Update: DispatchAssignEstateMap.bind(null, store),
    },
    Host: {
      Update: DispatchUpdateHost.bind(null, store),
      Destroy: DispatchDeleteHost.bind(null, store)
    }
  }
}