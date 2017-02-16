import { Record } from 'immutable';
import { IRegion } from '../../Types';

const RegionClass = Record({
  uuid: '',
  name: '',
  x: 1000,
  y: 1000,
  estateName: '',
  status: '',
  node: '',
  isRunning: false
})

export class Region extends RegionClass implements IRegion {
  readonly uuid: string
  readonly name: string
  readonly estateName: string
  readonly x: number
  readonly y: number
  readonly node: string
  readonly isRunning: boolean
  readonly status: string

  set(key: string, value: string | number | boolean): Region {
    return <Region>super.set(key, value);
  }
}