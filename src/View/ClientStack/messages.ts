import { performCall, NetworkResponse } from './call';

export interface LoginResponse extends NetworkResponse {
    uuid: string
    username: string
    isAdmin: boolean
    email: string
    token: string
}

import { IEstate, IManager, IEstateMap } from '../../Types';
export interface GetEstatesResponse extends NetworkResponse {
    Estates: IEstate[]
    Managers: IManager[]
    EstateMap: IEstateMap[]
}

import { IGroup, IMember, IRole } from '../../Types';
export interface GetGroupsResponse extends NetworkResponse {
    Groups: IGroup[]
    Members: IMember[]
    Roles: IRole[]
}


import { IHost } from '../../Types';
export interface GetHostsResponse extends NetworkResponse {
    Hosts: IHost[]
}

import { IJob } from '../../Types';
export interface GetJobsResponse extends NetworkResponse {
    Jobs: IJob[]
}

import { IRegion } from '../../Types';
export interface GetRegionsResponse extends NetworkResponse {
    Success: boolean
    Regions: IRegion[]
}

import { IUser, IPendingUser } from '../../Types';
export interface GetUsersResponse extends NetworkResponse {
    Success: boolean
    Users: IUser[]
    Pending: IPendingUser[]
}