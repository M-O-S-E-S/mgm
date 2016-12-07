import { Action, Dispatch, Middleware, Store } from 'redux';
import { StateModel } from '../redux/model'
import { Connection } from './Connection';
import { MessageTypes } from '../../common/MessageTypes';
import { IJob } from '../../common/messages'
import { Job, UpsertJobAction } from '../components/Account';

export function handleJobMessages(store: Store<StateModel>) {
  Connection.instance().sock.on(MessageTypes.ADD_JOB, (j: IJob) => {
    store.dispatch(UpsertJobAction(new Job(j)));
  })
}