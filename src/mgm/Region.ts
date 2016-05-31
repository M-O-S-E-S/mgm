
import { UUIDString } from '../halcyon/UUID';

export class Region {
  uuid: UUIDString
  name: string
  size: number
  httpPort: number
  consolePort: number
  consoleUname: UUIDString
  consolePass: UUIDString
  locX: number
  locY: number
  externalAddress: string
  slaveAddress: string
  isRunning: boolean
  status: any
}
