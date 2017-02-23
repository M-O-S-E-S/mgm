import { Users } from './Users';
import { Hosts } from './Hosts';
import { Regions } from './Regions';
import { Estates } from './Estates';
import { PendingUsers } from './PendingUsers';
import { Jobs } from './Jobs';
import { Groups } from './Groups';
import { OfflineMessages } from './OfflineMessages';

import { IUser, IHost, IRegion, IEstate, IManager, IEstateMap, IPendingUser, IJob, IGroup, IRole, IMember } from '../Types';

import { IPool, createPool } from 'promise-mysql';
import { Credential } from '../Auth';

export interface Store {
  Hosts: {
    getAll(): Promise<IHost[]>
    create(address: string): Promise<IHost>
    destroy(id: number): Promise<void>
    getByAddress(address: string): Promise<IHost>
    setStatus(host: IHost, status: string): Promise<IHost>
  },
  Regions: {
    getAll(): Promise<IRegion[]>
    getByUUID(uuid: string): Promise<IRegion>
    setStatus(region: IRegion, isRunning: boolean, status: string): Promise<IRegion>
    setHost(region: IRegion, host: IHost): Promise<IRegion>
    setPortAndAddress(region: IRegion, port: number, address: string): Promise<IRegion>
    setXY(region: IRegion, x: number, y: number): Promise<IRegion>
    getByNode(host: IHost): Promise<IRegion[]>
  }
  Users: {
    getAll(): Promise<IUser[]>
    getByID(uuid: string): Promise<IUser>
    getByEmail(email: string): Promise<IUser>
    getByName(name: string): Promise<IUser>
    setPassword(user: IUser, credential: Credential): Promise<void>
  },
  Groups: {
    getAll(): Promise<IGroup[]>
    getRoles(): Promise<IRole[]>
    getMembers(): Promise<IMember[]>
    addMember(user: IMember): Promise<void>
    removeMember(user: IMember): Promise<void>
  }
  PendingUsers: {
    getAll(): Promise<IPendingUser[]>
    create(name: string, email: string, template: string, cred: Credential, summary: string): Promise<IPendingUser>
  },
  Jobs: {
    getFor(uuid: string): Promise<IJob[]>
    getByID(id: number): Promise<IJob>
    create(type: string, owner: IUser, content: string): Promise<IJob>
    destroy(j: IJob): Promise<void>
  },
  Estates: {
    create(name: string, owner: string): Promise<IEstate>
    destroy(id: number): Promise<void>
    getAll(): Promise<IEstate[]>
    getById(id: number): Promise<IEstate>
    getManagers(): Promise<IManager[]>
    getMapping(): Promise<IEstateMap[]>
    setEstateForRegion(estate: IEstate, region: IRegion): Promise<void>
  },
  OfflineMessages: {
    save(to: string, message: string): Promise<void>
    getFor(uuid: string): Promise<string[]>
    destroyFor(uuid: string): Promise<void>
  }
}

interface DatabaseCredentials {
  host: string
  user: string
  pass: string
  name: string
}

export function getStore(mgmCredentials: DatabaseCredentials, halcyonCredentials: DatabaseCredentials): Store {
  let mgmDB: IPool = createPool({
    connectionLimit: 10,
    host: mgmCredentials.host,
    user: mgmCredentials.user,
    password: mgmCredentials.user,
    database: mgmCredentials.name
  });

  mgmDB.getConnection((err, connection) => {
    if (err)
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
    if (err)
      throw err;
    console.log('connected to the Halcyon database');
  })

  return {
    Hosts: new Hosts(mgmDB),
    Regions: new Regions(mgmDB),
    Users: new Users(halDB),
    Groups: new Groups(halDB),
    PendingUsers: new PendingUsers(mgmDB),
    Estates: new Estates(halDB),
    Jobs: new Jobs(mgmDB),
    OfflineMessages: new OfflineMessages(mgmDB),
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