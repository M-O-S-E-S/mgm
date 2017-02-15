
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
