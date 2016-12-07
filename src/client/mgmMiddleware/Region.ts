import { Action, Dispatch, Middleware, Store } from 'redux';
import { StateModel } from '../redux/model'
import { Connection } from './Connection';
import { MessageTypes } from '../../common/MessageTypes';
import { IRegion, IRegionStat } from '../../common/messages'
import { Region, UpsertRegionAction, RegionStat, UpsertRegionStatAction } from '../components/Regions';

export function RequestStartRegion(r: Region) {
  Connection.instance().sock.emit(MessageTypes.START_REGION, r.uuid, (success: boolean, message: string) => {
    if (success) {
      alertify.success('Region ' + r.name + ' queued to start');
    } else {
      alertify.error('Could not start region ' + r.name + ': ' + message);
    }
  })
}

export function handleRegionMessages(store: Store<StateModel>) {
  Connection.instance().sock.on(MessageTypes.ADD_REGION, (r: IRegion) => {
    store.dispatch(UpsertRegionAction(new Region(r)));
  })
  Connection.instance().sock.on(MessageTypes.REGION_STATUS, (stat: IRegionStat) => {
    store.dispatch(UpsertRegionStatAction(new RegionStat(stat)));
  })
}