import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { IJob } from '../../../common/messages';

const UPSERT_JOB = "ACCOUNT_UPSERT_JOB";

interface JobAction extends Action {
  job: Job
}

const JobClass = Record({
  id: 0,
  timestamp: '',
  type: '',
  user: '',
  data: ''
})

export class Job extends JobClass implements IJob {
  id: number
  timestamp: string
  type: string
  user: string
  data: string

  set(key: string, value: string | number): Job {
    return <Job>super.set(key, value);
  }
}

export const UpsertJobAction = function(job: Job): Action {
  let act: JobAction = {
    type: UPSERT_JOB,
    job: job
  }
  return act
}

export const JobsReducer = function(state = Map<number, Job>(), action: Action): Map<number, Job> {
  switch (action.type) {
    case UPSERT_JOB:
      let j = <JobAction>action;
      return state.set(j.job.id, j.job);
    default:
      return state;
  }
}