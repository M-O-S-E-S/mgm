import { Users } from './Users';
import { Hosts } from './Hosts';
import { Regions } from './Regions';
import { Estates } from './Estates';
import { PendingUsers } from './PendingUsers';
import { Jobs } from './Jobs';
import { Groups } from './Groups';
import { OfflineMessages } from './OfflineMessages';

import { IUser, IHost, IRegion, IEstate, IManager, IEstateMap, IPendingUser, IJob, IGroup, IRole, IMember } from '../types';

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
    create(name: string, x: number, y: number): Promise<IRegion>
    delete(r: IRegion): Promise<void>
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
    setAccessLevel(u: IUser, accessLevel: number): Promise<IUser>
    setEmail(u: IUser, email: string): Promise<IUser>
    retemplateUser(user: IUser, template: IUser): Promise<IUser>
    createUserFromSkeleton(fname: string, lname: string, cred: Credential, email: string): Promise<IUser>
    createUserFromTemplate(fname: string, lname: string, cred: Credential, email: string, template: IUser): Promise<IUser>
    delete(u: IUser): Promise<void>
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
    getByName(name: string): Promise<IPendingUser>
    delete(user: IPendingUser): Promise<void>
  },
  Jobs: {
    getFor(uuid: string): Promise<IJob[]>
    getByID(id: number): Promise<IJob>
    create(type: string, owner: IUser, content: string): Promise<IJob>
    destroy(j: IJob): Promise<void>
    setData(j: IJob, data: string): Promise<IJob>
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
  password: string
  database: string
}

export function getStore(mgmCredentials: DatabaseCredentials, halcyonCredentials: DatabaseCredentials): Store {
  let mgmDB: IPool = createPool({
    connectionLimit: 10,
    host: mgmCredentials.host,
    user: mgmCredentials.user,
    password: mgmCredentials.password,
    database: mgmCredentials.database
  });

  let halDB: IPool = createPool({
    connectionLimit: 10,
    host: halcyonCredentials.host,
    user: halcyonCredentials.user,
    password: halcyonCredentials.password,
    database: halcyonCredentials.database
  });

  return {
    Hosts: new Hosts(mgmDB),
    Regions: new Regions(mgmDB, halDB),
    Users: new Users(halDB),
    Groups: new Groups(halDB),
    PendingUsers: new PendingUsers(mgmDB),
    Estates: new Estates(halDB),
    Jobs: new Jobs(mgmDB),
    OfflineMessages: new OfflineMessages(mgmDB),
  };
}
