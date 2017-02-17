import { Action } from 'redux';
import { Map } from 'immutable';
import { EstateMap } from '../../Immutable';

const ASSIGN_REGION = 'ESTATES_ASSIGN_REGION';

interface Store {
  dispatch(action: AssignEstateMap): void
}

interface AssignEstateMap extends Action {
  regions: EstateMap[]
}

export function DispatchAssignEstateMap(store: Store, estateMap: EstateMap | EstateMap[]): Action {
  if (!estateMap) return;
  store.dispatch(<AssignEstateMap>{
    type: ASSIGN_REGION,
    regions: [].concat(estateMap)
  });
}

export function EstateMapReducer(state = Map<string, number>(), action: Action): Map<string, number> {
  switch (action.type) {
    case ASSIGN_REGION:
      let update = <AssignEstateMap>action;
      update.regions.map((r: EstateMap) => {
        state = state.set(r.RegionID, r.EstateID);
      })
      return state;
    default:
      return state;
  }
}