import { performCall, NetworkResponse } from './call';

export interface LoginResponse extends NetworkResponse {
    uuid: string
    username: string
    isAdmin: boolean
    email: string
    token: string
}

import { IEstate, IManager, IEstateMap } from '../../Store';
export interface GetEstatesResponse extends NetworkResponse {
    Estates: IEstate[]
    Managers: IManager[]
    Map: IEstateMap[]
}

import { IGroup, IMember, IRole } from '../../Store';
export interface GetGroupsResponse extends NetworkResponse {
    Groups: IGroup[]
    Members: IMember[]
    Roles: IRole[]
}


import { IHost } from '../../Store';
export interface GetHostsResponse extends NetworkResponse {
    Hosts: IHost[]
}

import { IJob } from '../../Store';
export interface GetJobsResponse extends NetworkResponse {
    Jobs: IJob[]
}

import { IRegion } from '../../Store';
export interface GetRegionsResponse extends NetworkResponse {
    Success: boolean
    Regions: IRegion[]
}

import { IUser, IPendingUser } from '../../Store';
export interface GetUsersResponse extends NetworkResponse {
    Success: boolean
    Users: IUser[]
    Pending: IPendingUser[]
}