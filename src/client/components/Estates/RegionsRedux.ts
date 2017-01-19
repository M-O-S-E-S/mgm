import { Action } from 'redux';
import { Map } from 'immutable';
import { IEstateMap } from '../../../common/messages';

const ASSIGN_REGION = 'ESTATES_ASSIGN_REGION';
const ASSIGN_REGION_BULK = 'ESTATE_ASSIGN_REGION_BULK';

interface EstateMapAction extends Action {
  region: IEstateMap
}

interface EstateMapBulkAction extends Action {
  regions: IEstateMap[]
}

export const AssignRegionEstateAction = function(r: IEstateMap): Action {
  let act: EstateMapAction = {
    type: ASSIGN_REGION,
    region: r
  }
  return act;
}

export const AssignRegionEstatBulkAction = function(r: IEstateMap[]): Action {
  let act: EstateMapBulkAction = {
    type: ASSIGN_REGION_BULK,
    regions: r
  }
  return act;
}

export const EstateMapReducer = function(state = Map<string, number>(), action: Action): Map<string, number> {
  switch (action.type) {
    case ASSIGN_REGION:
      let ra = <EstateMapAction>action;
      return state.set(ra.region.region, ra.region.estate);
    case ASSIGN_REGION_BULK:
      let rb = <EstateMapBulkAction>action;
      rb.regions.map( (r: IEstateMap) => {
        state = state.set(r.region, r.estate);
      });
      return state;
    default:
      return state;
  }
}