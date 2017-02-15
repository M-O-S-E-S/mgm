
export interface User {
    UUID: string
    username: string
    lastname: string
    email: string

    name(): string
    isSuspended():boolean
    isAdmin():boolean
}

export interface PendingUser {
    name: string
    email: string
    gender: string
    registered: string
    summary: string
}

export interface Region {
    uuid: string
    name: string
    x: number
    y: number
    status: string
    node: string
    isRunning: Boolean
}

export interface Host {
    id: number
    address: string
    name: string
    slots: number
    status: string
}

export interface Group {
    GroupID: string
    Name: string
    FounderID: string
    OwnerRoleID: string
}

export interface Role {
    GroupID: string
    RoleID: string
    Name: string
    Description: string
    Title: string
    Powers: number
}

export interface Membership {
    GroupID: string
    AgentID: string
    SelectedRoleID: string
}

export interface Estate {
    EstateID: number
    EstateName: string
    EstateOwner: string
}

export interface Manager {
    EstateID: number
    uuid: string
}

export interface EstateMap {
    RegionID: string
    EstateID: number
}

export interface Job {
    id: number
    timestamp: string
    type: string
    user: string
    data: string
}

export interface HostStat {
    memPercent: number
    memKB: number
    cpuPercent: number[]
    timestamp: number
    netSentPer: number
    netRecvPer: number
}

export interface RegionStat {
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
