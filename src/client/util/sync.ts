import { Store } from 'redux';
import { StateModel } from '../redux/model';
import { get } from './network';

import {
  IJob,
  IRegion,
  IEstate, IManager, IEstateMap,
  IGroup, IMembership, IRole,
  IHost,
  IUser, IPendingUser
} from '../../common/messages';

import { Region, UpsertRegionBulkAction } from '../components/Regions';
import { Estate, UpsertEstateBulkAction, UpsertManagerBulkAction, AssignRegionEstateAction } from '../components/Estates';
import {
  Group, UpsertGroupAction,
  UpsertMemberAction,
  Role, UpsertRoleAction
} from '../components/Groups';
import { Host, UpsertHostAction } from '../components/Hosts';
import { User, UpsertUserBulkAction } from '../components/Users';
import { PendingUser, UpsertPendingUserAction } from '../components/PendingUsers';
import { Job, UpsertJobBulkAction } from '../components/Account';

interface NetworkResult {
  Success: Boolean
  Message?: string
}

interface jobResult extends NetworkResult {
  Jobs: IJob[]
}
interface regionResult extends NetworkResult {
  Regions: IRegion[]
}

interface estateResult extends NetworkResult {
  Estates: IEstate[]
  Managers: IManager[]
  Map: IEstateMap[]
}

interface groupResult extends NetworkResult {
  Groups: IGroup[]
  Members: IMembership[]
  Roles: IRole[]
}

interface hostResult extends NetworkResult {
  Hosts: IHost[]
}

interface userResult extends NetworkResult {
  Users: IUser[]
  Pending: IPendingUser[]
}

export class Synchroniser {
  private store: Store<StateModel>

  constructor(store: Store<StateModel>) {
    this.store = store;
  }

  sync() {
    this.jobs();
    this.regions();
    this.estates();
    this.groups();
    this.hosts();
    this.users();
  }

  private jobs() {
    get('/api/task').then((res: jobResult) => {
      if (!res.Success) return;
      this.store.dispatch(UpsertJobBulkAction(res.Jobs.map((j: IJob) => {
        return new Job(j);
      })))
    });
  }

  private regions() {
    get('/api/region').then((res: regionResult) => {
      if (!res.Success) return;
      this.store.dispatch(UpsertRegionBulkAction(res.Regions.map((r: IRegion) => {
        return new Region(r);
      })));
    });
  }

  private estates() {
    get('/api/estate').then((res: estateResult) => {
      if (!res.Success) return;
      this.store.dispatch(UpsertEstateBulkAction(
        res.Estates.map((r: IEstate) => {
          return new Estate(r);
        })
      ));
      this.store.dispatch(UpsertManagerBulkAction(res.Managers));
      
      res.Map.map((m: IEstateMap) => {
          this.store.dispatch(AssignRegionEstateAction(m));
        })
    });
  }

  private groups() {
    get('/api/group').then((res: groupResult) => {
      if (!res.Success) return;
      res.Groups.map((r: IGroup) => {
        this.store.dispatch(UpsertGroupAction(new Group(r)));
      });
      res.Members.map((m: IMembership) => {
        this.store.dispatch(UpsertMemberAction(m));
      });
      res.Roles.map((r: IRole) => {
        this.store.dispatch(UpsertRoleAction(new Role(r)));
      });
    });
  }

  private hosts() {
    get('/api/host').then((res: hostResult) => {
      if (!res.Success) return;
      res.Hosts.map((h: IHost) => {
        this.store.dispatch(UpsertHostAction(new Host(h)));
      });
    });
  }

  private users() {
    get('/api/user').then((res: userResult) => {
      if (!res.Success) return;
      this.store.dispatch(UpsertUserBulkAction(
        res.Users.map((u: IUser) => {
          return new User(u);
        })
      ));
      res.Pending.map((u: IPendingUser) => {
        this.store.dispatch(UpsertPendingUserAction(new PendingUser(u)));
      });
    });
  }

}