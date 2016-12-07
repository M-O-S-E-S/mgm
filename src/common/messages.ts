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
  readonly httpPort: number
  readonly locX: number
  readonly locY: number
  readonly externalAddress: string
  readonly slaveAddress: string
}

export interface IHost {
  id: number
  address: string
  port: number
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
  EstateID: number
  EstateName: string
  EstateOwner: string
}

export interface IManager {
  EstateId: number
  uuid: string
  ID: number
}

export interface IEstateMap {
  RegionID: string
  EstateID: number
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