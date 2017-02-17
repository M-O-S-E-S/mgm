import { Action } from 'redux';
import { Record, Map } from 'immutable';
import { Job } from '../../Immutable';

interface Store {
  dispatch(action: UpdateJob | DeleteJob): void
}

const UPDATE_JOB = "JOB_UPSERT_JOB";
const DELETE_JOB = "JOB_DELETE_JOB";

interface UpdateJob extends Action {
  jobs: Job[]
}

interface DeleteJob extends Action {
  jobs: number[]
}

export function UpdateJob(store: Store, job: Job | Job[]): void {
  if (!job) return;
  store.dispatch(<UpdateJob>{
    type: UPDATE_JOB,
    jobs: [].concat(job)
  });
}

export function DestroyJob(store: Store, job: Job | Job[] | number | number[]): void {
  if (!job) return;
  store.dispatch(<UpdateJob>{
    type: DELETE_JOB,
    jobs: [].concat(job)
  });
}

export const JobsReducer = function (state = Map<number, Job>(), action: Action): Map<number, Job> {
  switch (action.type) {
    case UPDATE_JOB:
      let update = <UpdateJob>action;
      update.jobs.map((j: Job) => {
        let rec = state.get(j.id) || new Job();
        state = state.set(j.id,
          rec.set('id', j.id)
            .set('timestamp', j.timestamp)
            .set('type', j.type)
            .set('user', j.user)
            .set('data', j.data)
        );
      })
      return state;
    case DELETE_JOB:
      let del = <DeleteJob>action;
      del.jobs.map((id: number) => {
        state = state.delete(id);
      });
      return state;
    default:
      return state;
  }
}