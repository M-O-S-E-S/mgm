
import { Map, Record, Set } from 'immutable';
import { User } from '../components/Users';
import { Region, RegionStat } from '../components/Regions';
import { Host, HostStat } from '../components/Hosts';
import { Estate } from '../components/Estates';
import { Group, Role } from '../components/Groups';
import { PendingUser } from '../components/PendingUsers';
import { Job } from '../components/Account';

/** AUTH */
interface IAuth {
  user: User,
  loggedIn: boolean,
  errorMsg: string,
  token: string
}

const AuthClass = Record({
  user: new User(),
  loggedIn: false,
  errorMsg: '',
  token: ''
})

export class Auth extends AuthClass implements IAuth {
  user: User
  loggedIn: boolean
  errorMsg: string
  token: string

  set(key: string, value: string | boolean | User): Auth {
    return <Auth>super.set(key, value);
  }
}

/** APPLICATION STATE */

export interface IStateModel {
  auth: Auth
  url: string
  hosts: Map<number, Host>
  hostStats: Map<number, HostStat>
  regions: Map<string, Region>
  regionStats: Map<string, RegionStat>
  estateMap: Map<string, number>
  users: Map<string, User>
  pendingUsers: Map<string, PendingUser>
  groups: Map<string, Group>
  members: Map<string, Map<string, string>>
  roles: Map<string, Map<string, Role>>
  estates: Map<number, Estate>
  managers: Map<number, Set<string>>
  jobs: Map<number, Job>
}

const StateModelClass = Record({
  auth: new Auth(),
  url: '',
  hosts: Map<number, Host>(),
  hostStats: Map<number, HostStat>(),
  regions: Map<string, Region>(),
  regionStats: Map<string, RegionStat>(),
  estateMap: Map<string, number>(),
  users: Map<string, User>(),
  pendingUsers: Map<string, PendingUser>(),
  groups: Map<string, Group>(),
  members: Map<string, Map<string, string>>(),
  roles: Map<string, Map<string, Role>>(),
  estates: Map<number, Estate>(),
  managers: Map<number, Set<string>>(),
  jobs: Map<number, Job>()
})

export class StateModel extends StateModelClass implements IStateModel {
  auth: Auth
  url: string
  hosts: Map<number, Host>
  hostStats: Map<number, HostStat>
  regions: Map<string, Region>
  regionStats: Map<string, RegionStat>
  estateMap: Map<string, number>
  users: Map<string, User>
  pendingUsers: Map<string, PendingUser>
  groups: Map<string, Group>
  members: Map<string, Map<string, string>>
  roles: Map<string, Map<string, Role>>
  estates: Map<number, Estate>
  managers: Map<number, Set<string>>
  jobs: Map<number, Job>

  set(
    key: string,
    value:
      Auth |
      string |
      Map<string, User> |
      Map<number, Host> |
      Map<string, Region> |
      Map<string, number> |
      Map<string, PendingUser> |
      Map<string, Group> |
      Map<string, Map<string, Role>> |
      Map<number, Estate> |
      Map<string, Set<string>> |
      Map<number, Set<string>> |
      Map<string, Map<string,string>> |
      Map<number, Job> | 
      Map<number, HostStat> |
      Map<string, RegionStat>
  ): StateModel {
    return <StateModel>super.set(key, value);
  }
}