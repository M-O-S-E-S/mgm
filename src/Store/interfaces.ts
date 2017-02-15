
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
