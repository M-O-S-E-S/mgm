import { Record } from 'immutable';
import { Job as IJob } from '../../Store';

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

  set(key: string, value: string | number): Job {
    return <Job>super.set(key, value);
  }
}