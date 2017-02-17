import { ClientStack, NetworkResponse, GetEstateResponse, GetGroupResponse, GetUserResponse } from '../ClientStack';
import { Map, Set } from 'immutable';
import { ReduxStore } from '../Redux';

import {
  IJob,
  IRegion,
  IEstate, IManager, IEstateMap,
  IGroup, IMember, IRole,
  IUser, IPendingUser,
  IHost
} from '../../Types';

import { Region, Estate, Manager, EstateMap, Group, Role, Member, Host, User, PendingUser, Job } from '../Immutable';

interface jobResult extends NetworkResponse {
  Jobs: IJob[]
}
interface regionResult extends NetworkResponse {
  Regions: IRegion[]
}

interface estateResult extends NetworkResponse {
  Estates: IEstate[]
  Managers: IManager[]
  Map: IEstateMap[]
}

interface groupResult extends NetworkResponse {
  Groups: IGroup[]
  Members: IMember[]
  Roles: IRole[]
}

interface hostResult extends NetworkResponse {
  Hosts: IHost[]
}

interface userResult extends NetworkResponse {
  Users: User[]
  Pending: IPendingUser[]
}

export function Synchronizer(store: ReduxStore): void {
  jobs(store);
  regions(store);
  estates(store);
  groups(store);
  hosts(store);
  users(store);
}

function jobs(store: ReduxStore) {
  let stale = store.GetState().jobs.keySeq().toSet();
  ClientStack.Job.Get().then((jobs: IJob[]) => {
    return jobs.map((j: IJob) => {
      stale = stale.delete(j.id);
      let job = new Job(j);
      return job;
    })
  }).then((jobs: Job[]) => {
    store.Job.Update(jobs);
    store.Job.Destroy(stale.toArray());
  });
};

function regions(store: ReduxStore) {
  let stale = store.GetState().regions.keySeq().toSet();
  ClientStack.Region.Get().then((regions: IRegion[]) => {
    return regions.map((r: IRegion) => {
      stale = stale.delete(r.uuid);
      let region = new Region(r);
      return region;
    })
  }).then((regions: Region[]) => {
    store.Region.Update(regions);
    store.Region.Destroy(stale.toArray());
  });
};

function estates(store: ReduxStore) {
  ClientStack.Estate.Get().then((res: GetEstateResponse) => {
    let staleEstates = store.GetState().estates.keySeq().toSet();
    store.Estate.Update(
      res.Estates.map((r: IEstate) => {
        staleEstates = staleEstates.delete(r.EstateID);
        return new Estate(r);
      })
    );
    store.Estate.Destroy(staleEstates.toArray());

    let staleManagers = Map<number, Set<string>>();
    store.GetState().estates.keySeq().toArray().map((id) => {
      staleManagers = staleManagers.set(id, store.GetState().managers.get(id, Set<string>()));
    })
    store.Estate.UpdateManager(res.Managers.map((m) => {
      let managers = staleManagers.get(m.EstateID, Set<string>());
      managers = managers.delete(m.uuid);
      staleManagers = staleManagers.set(m.EstateID, managers);
      return new Manager(m);
    }));
    staleManagers.map((managers, group) => {
      store.Estate.DestroyManager(group, managers.toArray());
    });

    // EstateMap almost never deletes, and is only used internally, ignore stale values
    store.Estate.UpdateMap(res.EstateMap.map((m: IEstateMap) => {
      return new EstateMap(m);
    }));
  });
}

function groups(store: ReduxStore) {
  ClientStack.Group.Get().then((res: GetGroupResponse) => {
    let staleGroups = store.GetState().groups.keySeq().toSet();
    store.Group.Update(
      res.Groups.map((r: IGroup) => {
        staleGroups = staleGroups.delete(r.GroupID);
        return (new Group(r));
      })
    );
    store.Group.Destroy(staleGroups.toArray());

    let staleMembers = Map<string, Set<string>>();
    store.GetState().groups.keySeq().toArray().map((g) => {
      staleMembers = staleMembers.set(g, store.GetState().members.get(g, Map<string, string>()).keySeq().toSet());
    })
    store.Group.AddMember(res.Members.map((m) => {
      let members = staleMembers.get(m.GroupID, Set<string>());
      members = members.delete(m.AgentID);
      staleMembers = staleMembers.set(m.GroupID, members);
      return new Member(m);
    }));
    staleMembers.map((members, group) => {
      store.Group.DestroyMember(members.toArray().map((user: string) => {
        return new Member({
          GroupID: group,
          AgentID: user
        });
      }));
    });


    // GrouptID -> RoleID
    let staleRoles = Map<string, Set<string>>();
    store.GetState().groups.keySeq().toArray().map((g) => {
      staleRoles = staleRoles.set(g, store.GetState().roles.get(g, Map<string, Role>()).keySeq().toSet());
    })
    store.Group.AddRole(
      res.Roles.map((r: IRole) => {
        let roles = staleRoles.get(r.GroupID, Set<string>());
        roles = roles.delete(r.RoleID);
        staleRoles = staleRoles.set(r.GroupID, roles);
        return new Role(r);
      })
    );
    staleRoles.map((roles, group) => {
      store.Group.DestroyRole(roles.toArray().map((id: string) => {
        return new Role({
          GroupID: group,
          RoleID: id
        });
      }))
    })
  });
}

function hosts(store: ReduxStore) {
  ClientStack.Host.Get().then((hosts: IHost[]) => {
    let staleHosts = store.GetState().hosts.keySeq().toSet();
    store.Host.Update(
      hosts.map((h: IHost) => {
        staleHosts = staleHosts.delete(h.id);
        return new Host(h);
      })
    );
    store.Host.Destroy(staleHosts.toArray());
  });
}

function users(store: ReduxStore) {
  ClientStack.User.Get().then((res: GetUserResponse) => {
    let staleUsers = store.GetState().users.keySeq().toSet();
    store.User.Update(
      res.Users.map((u: IUser) => {
        staleUsers = staleUsers.delete(u.UUID);
        // convert the User object into an immutablejs Record
        return new User(u);
      })
    );
    store.User.Destroy(staleUsers.toArray());

    let stalePending = store.GetState().pendingUsers.keySeq().toSet();
    store.PendingUser.Update(res.PendingUser.map((u: IPendingUser) => {
      stalePending = stalePending.delete(u.name);
      return new PendingUser(u);
    }));
    store.PendingUser.Destroy(stalePending.toArray());
  });
}