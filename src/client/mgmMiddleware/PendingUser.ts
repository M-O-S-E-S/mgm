import { Action, Dispatch, Middleware, Store } from 'redux';
import { StateModel } from '../redux/model';
import { Connection } from './Connection';
import { MessageTypes } from '../../common/MessageTypes';
import { IPendingUser } from '../../common/messages';
import { PendingUser, UpsertPendingUserAction } from '../components/PendingUsers';


export function handlePendingUserMessages(store: Store<StateModel>) {
  Connection.instance().sock.on(MessageTypes.ADD_PENDING_USER, (u: IPendingUser) => {
    store.dispatch(UpsertPendingUserAction(new PendingUser(u)));
  });
}