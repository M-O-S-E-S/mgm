import { Action, Dispatch, Middleware, Store } from 'redux';
import { StateModel } from '../redux/model'
import { Connection } from './Connection';
import { MessageTypes } from '../../common/MessageTypes';
import { IEstate, IManager, IEstateMap } from '../../common/messages'
import { Estate, UpsertEstateAction, EstateDeletedAction, CreateManagerAction, AssignRegionEstateAction } from '../components/Estates';

export function RequestCreateEstate(name: string, owner: string) {
  Connection.instance().sock.emit(MessageTypes.REQUEST_CREATE_ESTATE, name, owner, (success: boolean, message: string) => {
    if (success) {
      alertify.success('Estate ' + name + ' created');
    } else {
      alertify.error('Could not create estate ' + name + ': ' + message);
    }
  })
}

export function RequestDeleteEstate(e: Estate) {
  Connection.instance().sock.emit(MessageTypes.REQUEST_DELETE_ESTATE, e.EstateID, (success: boolean, message: string) => {
    if (success) {
      alertify.success('Estate ' + e.EstateName + ' deleted');
    } else {
      alertify.error('Could not delete estate ' + e.EstateName + ': ' + message);
    }
  })
}

export function handleEstateMessages(store: Store<StateModel>) {
  Connection.instance().sock.on(MessageTypes.ADD_ESTATE, (estate: IEstate) => {
    store.dispatch(UpsertEstateAction(new Estate(estate)));
  })
  Connection.instance().sock.on(MessageTypes.ESTATE_DELETED, (id: number) => {
    store.dispatch(EstateDeletedAction(id));
  })

  Connection.instance().sock.on(MessageTypes.ADD_MANAGER, (manager: IManager) => {
    store.dispatch(CreateManagerAction(manager));
  })
  Connection.instance().sock.on(MessageTypes.ADD_REGION_ESTATE, (region: IEstateMap) => {
    store.dispatch(AssignRegionEstateAction(region));
  })
}