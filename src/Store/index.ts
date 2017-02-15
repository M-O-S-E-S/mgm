
export { User, PendingUser, Host, Estate, Manager, EstateMap } from './interfaces';
export { GetUserPermissions } from './permissions';

import { IPool, createPool } from 'mysql';

import { User, PendingUser, Host, Estate, Manager, EstateMap } from './interfaces';

export interface Store {
  Hosts: {
    getByAddress(address: string): Promise<Host>
  },
  Users: {
    getAll(): Promise<User[]>
    getByID(uuid: string): Promise<User>
  },
  PendingUsers: {
    getAll(): Promise<PendingUser[]>
  },
  Estates: {
    getAll(): Promise<Estate[]>
    getManagers(): Promise<Manager[]>
    getMapping(): Promise<EstateMap[]>
  }
}

interface DatabaseCredentials {
  host: string
  user: string
  pass: string
  name: string
}

import { Users } from './Users';
import { Hosts } from './Hosts';
import { Estates } from './Estates';

export function getStore(mgmCredentials: DatabaseCredentials, halcyonCredentials: DatabaseCredentials): Store {
  let mgmDB: IPool = createPool({
    connectionLimit: 10,
    host: mgmCredentials.host,
    user: mgmCredentials.user,
    password: mgmCredentials.user,
    database: mgmCredentials.name
  });

  mgmDB.getConnection((err, connection) => {
    if(err)
      throw err;
    console.log('connected to the MGM database');
  });

  let halDB: IPool = createPool({
    connectionLimit: 10,
    host: halcyonCredentials.host,
    user: halcyonCredentials.user,
    password: halcyonCredentials.user,
    database: halcyonCredentials.name
  });

  halDB.getConnection((err, connection) => {
    if(err)
      throw err;
    console.log('connected to the Halcyon database');
  })



  return {
    Hosts: new Hosts(mgmDB),
    Users: new Users(halDB),
    Estates: new Estates(halDB)
  };
}

/*
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

*/