

export interface IEstate {
  EstateID: number
  EstateName: string
  EstateOwner: string
}

export interface IManager {
  EstateID: number
  uuid: string
}

export interface IEstateMap {
  RegionID: string
  EstateID: number
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

export interface IMember {
  GroupID: string
  AgentID: string
  SelectedRoleID: string
}

export interface IHost {
  id: number
  address: string
  port: number
  name: string
  slots: string
  public_ip: string
  status: string
}

export interface IJob {
  id: number
  timestamp: Date
  type: string
  user: string
  data: string
}

export interface IPendingUser {
  name: string
  email: string
  gender: string
  password: string
  registered: Date
  summary: string
}

export interface IRegion {
  uuid: string
  name: string
  x: number
  y: number
  status: string
  node: string
  publicAddress: string
  port: number
  isRunning: Boolean
}

export interface IUser {
  UUID: string
  username: string
  lastname: string
  email: string
  created: Date
  partner: string

  name(): string
  isSuspended(): boolean
  isAdmin(): boolean
  authenticate(password: string): boolean
}