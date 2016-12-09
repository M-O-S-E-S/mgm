export interface IUser {
    uuid: string
    name: string
    email: string
    godLevel: number
}

export interface IPendingUser {
    name: string
    email: string
    gender: string
    registered: Date
    summary: string
}

export interface IRegion {
    readonly uuid: string
    readonly name: string
    readonly x: number
    readonly y: number
    readonly status: string
    readonly node: string
    readonly isRunning: Boolean
}

export interface IHost {
    id: number
    address: string
    name: string
    slots: number
}

export interface IGroup {
    GroupID: string
    Name: string
    FounderID: string
    OwnerRoleID: string
}

export interface IRole {
    GroupID: string
    RoleID: string
    Name: string
    Description: string
    Title: string
    Powers: number
}

export interface IMembership {
    GroupID: string
    AgentID: string
    SelectedRoleID: string
}

export interface IEstate {
    id: number
    name: string
    owner: string
}

export interface IManager {
    estate: number
    uuid: string
    id: number
}

export interface IEstateMap {
    region: string
    estate: number
}

export interface IJob {
    id: number
    timestamp: string
    type: string
    user: string
    data: string
}

export interface IHostStat {
    memPercent: number
    memKB: number
    cpuPercent: number[]
    timestamp: number
    netSentPer: number
    netRecvPer: number
}

export interface IRegionStat {
    id: string
    running: boolean
    stats: {
        timestamp: number
        uptime: number
        memPercent: number
        memKB: number
        cpuPercent: number
    }
}

export interface LoginResponse {
    uuid: string
    username: string
    accessLevel: string
    email: string
}