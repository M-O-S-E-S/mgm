
import { UUIDString } from '../halcyon/UUID';

export class Estate {
  id: number
  name: string
  owner: UUIDString
  managers: UUIDString[]
  regions: UUIDString[]
}
