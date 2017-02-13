import { Store } from 'redux';
import { StateModel } from '../redux/model';
import { get } from './network';
import { Map, Set } from 'immutable';

import {
  IJob,
  IRegion,
  IEstate, IManager, IEstateMap,
  IGroup, IMembership, IRole,
  IHost,
  IUser, IPendingUser
} from '../../common/messages';

import { Region, UpsertRegionBulkAction, DeleteRegionBulkAction } from '../components/Regions';
import {
  Estate,
  UpsertEstateBulkAction, UpsertManagerBulkAction, AssignRegionEstateBulkAction,
  DeleteEstateBulkAction, DeleteManagerBulkAction, DeleteRegionEstateBulkAction
} from '../components/Estates';
import {
  Group, UpsertGroupBulkAction, DeleteGroupBulkAction,
  UpsertMemberBulkAction, DeleteMemberBulkAction,
  Role, UpsertRoleBulkAction, DeleteRoleBulkAction
} from '../components/Groups';
import { Host, UpsertHostBulkAction } from '../components/Hosts';
import { User, UpsertUserBulkAction } from '../components/Users';
import { PendingUser, UpsertPendingUserAction } from '../components/PendingUsers';
import { Job, UpsertJobBulkAction, DeleteJobBulkAction } from '../components/Account';

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
  private session: {
    token: string
  }

  constructor(store: Store<StateModel>) {
    this.store = store;
    this.session = { token: this.store.getState().auth.token };
  }

  sync() {
    this.jobs();
    this.regions();
    this.estates();
    this.groups();
    this.hosts();
    this.users();
  }

  private jobs() {DeleteMemberBulkAction
    get('/api/task', this.session).then((res: jobResult) => {
      if (!res.Success) return;

      let stale = this.store.getState().jobs.keySeq().toSet();
      this.store.dispatch(UpsertJobBulkAction(res.Jobs.map((j: IJob) => {
        stale = stale.delete(j.id);
        return new Job(j);
      })));
      if (stale.size > 0)
        this.store.dispatch(DeleteJobBulkAction(stale.toArray()));
    });
  }

  private regions() {
    get('/api/region', this.session).then((res: regionResult) => {
      if (!res.Success) return;

      let stale = this.store.getState().regions.keySeq().toSet();
      this.store.dispatch(UpsertRegionBulkAction(res.Regions.map((r: IRegion) => {
        stale = stale.delete(r.uuid);
        return new Region(r);
      }))); DeleteEstateBulkAction
      if (stale.size > 0)
        this.store.dispatch(DeleteRegionBulkAction(stale.toArray()));
    });
  }

  private estates() {
    get('/api/estate', this.session).then((res: estateResult) => {
      if (!res.Success) return;

      let staleEstates = this.store.getState().estates.keySeq().toSet();
      this.store.dispatch(UpsertEstateBulkAction(
        res.Estates.map((r: IEstate) => {
          staleEstates = staleEstates.delete(r.id);
          return new Estate(r);
        })
      ));
      if (staleEstates.size > 0)
        this.store.dispatch(DeleteEstateBulkAction(staleEstates.toArray()));

      let staleManagers = Map<number, Set<string>>();
      this.store.getState().estates.keySeq().toArray().map((id) => {
        staleManagers = staleManagers.set(id, this.store.getState().managers.get(id, Set<string>()));
      })
      this.store.dispatch(UpsertManagerBulkAction(res.Managers.map((m) => {
        let managers = staleManagers.get(m.estate, Set<string>());
        managers = managers.delete(m.uuid);
        staleManagers = staleManagers.set(m.estate, managers);
        return m;
      })));
      staleManagers.map((managers, group) => {
        if (managers.size > 0)
          this.store.dispatch(DeleteManagerBulkAction(group, managers.toArray()));
      });

      let staleMap = this.store.getState().estateMap.keySeq().toSet();
      this.store.dispatch(AssignRegionEstateBulkAction(res.Map.map((m: IEstateMap) => {
        staleMap = staleMap.delete(m.region);
        return {
          region: m.region,
          estate: m.estate
        }
      })));
      // This is super rare, as a region must always have an estate.  It should only trigger on region deletion
      if (staleMap.size > 0)
        this.store.dispatch(DeleteRegionEstateBulkAction(staleMap.toArray()));
    });
  }

  private groups() {
    get('/api/group', this.session).then((res: groupResult) => {
      if (!res.Success) return;

      let staleGroups = this.store.getState().groups.keySeq().toSet();
      this.store.dispatch(UpsertGroupBulkAction(
        res.Groups.map((r: IGroup) => {
          staleGroups = staleGroups.delete(r.GroupID);
          return (new Group(r));
        })
      ));
      if (staleGroups.size > 0)
        this.store.dispatch(DeleteGroupBulkAction(staleGroups.toArray()));

      let staleMembers = Map<string, Set<string>>();
      this.store.getState().groups.keySeq().toArray().map((g) => {
        staleMembers = staleMembers.set(g, this.store.getState().members.get(g, Map<string, string>()).keySeq().toSet());
      })
      this.store.dispatch(UpsertMemberBulkAction(res.Members.map((m) => {
        let members = staleMembers.get(m.GroupID, Set<string>());
        members = members.delete(m.AgentID);
        staleMembers = staleMembers.set(m.GroupID, members);
        return m;
      })));
      staleMembers.map((members, group) => {
        if (members.size > 0)
          this.store.dispatch(DeleteMemberBulkAction(group, members.toArray()));
      });


      // GrouptID -> RoleID
      let staleRoles = Map<string, Set<string>>();
      this.store.getState().groups.keySeq().toArray().map((g) => {
        staleRoles = staleRoles.set(g, this.store.getState().roles.get(g, Map<string, Role>()).keySeq().toSet());
      })
      this.store.dispatch(UpsertRoleBulkAction(
        res.Roles.map((r: IRole) => {
          let roles = staleRoles.get(r.GroupID, Set<string>());
          roles = roles.delete(r.RoleID);
          staleRoles = staleRoles.set(r.GroupID, roles);
          return new Role(r);
        })
      ));
      staleRoles.map((roles, group) => {
        if (roles.size > 0)
          this.store.dispatch(DeleteRoleBulkAction(group, roles.toArray()));
      })
    });
  }

  private hosts() {
    get('/api/host', this.session).then((res: hostResult) => {
      if (!res.Success) return;
      this.store.dispatch(UpsertHostBulkAction(
        res.Hosts.map((h: IHost) => {
          return new Host(h);
        })
      ));
    });
  }

  private users() {
    get('/api/user', this.session).then((res: userResult) => {
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