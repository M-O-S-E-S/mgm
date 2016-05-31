
import { UUIDString } from '../halcyon/UUID';

export class Job {
  timestamp: string
  type: string
  user: UUIDString
  data: string
}
