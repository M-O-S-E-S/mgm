import { Record } from 'immutable';
import { IJob } from '../../Types';

const JobClass = Record({
  id: 0,
  timestamp: '',
  type: '',
  user: '',
  data: ''
})

export class Job extends JobClass implements IJob {
  id: number
  timestamp: Date
  type: string
  user: string
  data: string

  set(key: string, value: string | number | Date): Job {
    return <Job>super.set(key, value);
  }
}