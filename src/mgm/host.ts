
import { UUIDString } from '../halcyon/UUID';
import { Region } from './Region';

export class Host {
  address: string
  port: number
  name: string
  cmd_key: UUIDString
  slots: number
  status: any
}
