import { Action } from 'redux';
import { Map } from 'immutable';
import { IEstateMap } from '../../../common/messages';

const ASSIGN_REGION = 'ESTATES_ASSIGN_REGION'

interface EstateMapAction extends Action {
  region: IEstateMap
}

export const AssignRegionEstateAction = function(r: IEstateMap): Action {
  let act: EstateMapAction = {
    type: ASSIGN_REGION,
    region: r
  }
  return act;
}

export const EstateMapReducer = function(state = Map<string, number>(), action: Action): Map<string, number> {
  switch (action.type) {
    case ASSIGN_REGION:
      let ra = <EstateMapAction>action;
      return state.set(ra.region.region, ra.region.estate);
    default:
      return state;
  }
}