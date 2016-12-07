import { Action, Dispatch, Middleware, Store } from 'redux';
import { StateModel } from '../redux/model'
import { Connection } from './Connection';
import { MessageTypes } from '../../common/MessageTypes';
import { IHost, IHostStat } from '../../common/messages'
import { Host, HostStat, UpsertHostStatAction, UpsertHostAction, HostDeletedAction } from '../components/Hosts';

export function RequestCreateHost(address: string) {
  Connection.instance().sock.emit(MessageTypes.REQUEST_CREATE_HOST, address, (success: boolean, message: string) => {
    if (success) {
      alertify.success('Host ' + address + ' added');
    } else {
      alertify.error('Could not add host ' + address + ': ' + message);
    }
  })
}

export function RequestDeleteHost(host: Host) {
  Connection.instance().sock.emit(MessageTypes.REQUEST_DELETE_HOST, host.id, (success: boolean, message: string) => {
    if (success) {
      alertify.success('Host ' + host.address + ' removed');
    } else {
      alertify.error('Could not remove host ' + host.address + ': ' + message);
    }
  })
}

export function handleHostMessages(store: Store<StateModel>) {
  Connection.instance().sock.on(MessageTypes.ADD_HOST, (h: IHost) => {
    store.dispatch(UpsertHostAction(new Host(h)));
  })
  Connection.instance().sock.on(MessageTypes.HOST_DELETED, (id: number) => {
    store.dispatch(HostDeletedAction(id));
  })
  Connection.instance().sock.on(MessageTypes.HOST_STATUS, (id:number, stat: IHostStat) => {
    store.dispatch(UpsertHostStatAction(id, new HostStat(stat)));
  })
}