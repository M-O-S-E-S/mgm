
import { UUIDString } from '../halcyon/UUID';

export interface Job {
  id: number
  timestamp: string
  type: string
  user: UUIDString
  data: string
}
