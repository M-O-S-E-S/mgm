import { Action, Dispatch, Middleware, Store } from 'redux';
import { StateModel } from '../redux/model';
import { Connection } from './Connection';
import { MessageTypes } from '../../common/MessageTypes';
import { IUser } from '../../common/messages';
import { User, UpsertUserAction } from '../components/Users';

export function handleUserMessages(store: Store<StateModel>) {
  Connection.instance().sock.on(MessageTypes.ADD_USER, (u: IUser) => {
    store.dispatch(UpsertUserAction(new User(u)));
  })
}