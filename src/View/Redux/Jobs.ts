import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { Job } from '../Immutable';

const UPSERT_JOB = "ACCOUNT_UPSERT_JOB";
const DELETE_JOB = "ACCOUNT_DELETE_JOB";
const UPSERT_JOB_BULK = "ACCOUNT_UPSERT_JOB_BULK";
const DELETE_JOB_BULK = "ACCOUNT_DELETE_JOB_BULK";

interface JobAction extends Action {
  job: Job
}

interface JobActionBulk extends Action {
  jobs: Job[]
}

interface DeleteJobActionBulk extends Action {
  jobs: number[]
}

// internal function for code reuse concerning immutable objects
function upsertJob(state: Map<number, Job>, j: Job): Map<number, Job> {
  let rec = state.get(j.id) || new Job();
  return state.set(
    j.id,
    rec.set('id', j.id)
      .set('timestamp', j.timestamp)
      .set('type', j.type)
      .set('user', j.user)
      .set('data', j.data)
  );
}

export const DeleteJobAction = function (job: Job): Action {
  let act: JobAction = {
    type: DELETE_JOB,
    job: job
  }
  return act
}

export const UpsertJobAction = function (job: Job): Action {
  let act: JobAction = {
    type: UPSERT_JOB,
    job: job
  }
  return act
}

export const UpsertJobBulkAction = function (job: Job[]): Action {
  let act: JobActionBulk = {
    type: UPSERT_JOB_BULK,
    jobs: job
  }
  return act
}

export const DeleteJobBulkAction = function (j: number[]): Action {
  let act: DeleteJobActionBulk = {
    type: DELETE_JOB_BULK,
    jobs: j
  }
  return act;
}

export const JobsReducer = function (state = Map<number, Job>(), action: Action): Map<number, Job> {
  switch (action.type) {
    case UPSERT_JOB:
      let j = <JobAction>action;
      return upsertJob(state, j.job);
    case UPSERT_JOB_BULK:
      let jb = <JobActionBulk>action;
      jb.jobs.map((r: Job) => {
        state = upsertJob(state, r);
      })
      return state;
    case DELETE_JOB:
      j = <JobAction>action;
      return state.delete(j.job.id);
    case DELETE_JOB_BULK:
      let db = <DeleteJobActionBulk>action;
      db.jobs.map((id: number) => {
        state = state.delete(id);
      });
      return state;
    default:
      return state;
  }
}