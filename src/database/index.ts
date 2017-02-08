
import { IHost, IRegion, IPendingUser, IUser, IGroup, IRole, IMembership, IEstate, IManager, IEstateMap, IJob } from '../common/messages';

import { Config, Sql, MGMDB, HALCYONDB } from './mysql';

import { Users } from './Users';
import { Jobs } from './Jobs';
import { Estates } from './Estates';
import { Regions } from './Regions';
import { Groups } from './Groups';
import { Hosts } from './Hosts';
import { PendingUsers } from './PendingUsers';
import { OfflineMessages } from './OfflineMessages';


export class PersistanceLayer {
  private mgm: MGMDB
  private hal: HALCYONDB
  Users: Users;
  Jobs: Jobs;
  Estates: Estates;
  Regions: Regions;
  Groups: Groups;
  Hosts: Hosts;
  PendingUsers: PendingUsers;
  OfflineMessages: OfflineMessages;

  constructor(mgm: Config, halcyon: Config) {
    this.mgm = Sql.connectMGM(mgm);
    this.hal = Sql.connectHalcyon(halcyon);

    this.Users = new Users(this.hal.users,this.hal.appearance,this.hal.inventoryItems, this.hal.inventoryFolders);
    this.Jobs = new Jobs(this.mgm.jobs);
    this.Estates = new Estates(
      this.hal.estates, this.hal.managers, this.hal.estateMap,
      this.hal.estateBan, this.hal.estateGroups, this.hal.estateUsers);
    this.Regions = new Regions(this.mgm.regions);
    this.Groups = new Groups(this.hal.groups, this.hal.roles, this.hal.members);
    this.Hosts = new Hosts(this.mgm.hosts);
    this.PendingUsers = new PendingUsers(this.mgm.pendingUsers);
    this.OfflineMessages = new OfflineMessages(this.mgm.offlineMessages);
  }
}

export {
  Config,
  JobInstance,
  HostInstance,
  UserInstance,
  RegionInstance,
  EstateInstance,
  ManagerInstance,
  EstateMapInstance,
  GroupInstance,
  RoleInstance,
  MembershipInstance,
  PendingUserInstance,
  OfflineMessageInstance
} from './mysql';