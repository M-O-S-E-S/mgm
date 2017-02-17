import { Map, Record } from 'immutable';
import { Action } from 'redux';
import { Region } from '../../Immutable';

const UPDATE_REGION = "REGIONS_UPSERT_REGION";
const DELETE_REGION = "REGIONS_DELETE_REGION";

interface Store {
  dispatch(action: UpdateRegion | DeleteRegion): void
}

interface UpdateRegion extends Action {
  regions: Region[]
}

interface DeleteRegion extends Action {
  regions: string[]
}

export function DispatchUpdateRegion(store: Store, r: Region | Region[]): Action {
  if (!r) return;
  store.dispatch(<UpdateRegion>{
    type: UPDATE_REGION,
    regions: [].concat(r)
  });
}

export function DispatchDeleteRegion(store: Store, r: Region | Region[] | string | string[]): Action {
  if (!r) return;
  let regions = [].concat(r);
  if (typeof (regions[0]) === "string") {
    store.dispatch(<DeleteRegion>{
      type: DELETE_REGION,
      regions: regions
    });
  } else {
    store.dispatch(<DeleteRegion>{
      type: DELETE_REGION,
      regions: regions.map((r: Region) => { return r.uuid; })
    });
  }
}

export const RegionsReducer = function (state = Map<string, Region>(), action: Action): Map<string, Region> {
  switch (action.type) {
    case UPDATE_REGION:
      let act = <UpdateRegion>action;
      act.regions.map((r: Region) => {
        let reg = state.get(r.uuid, new Region());
        state = state.set(
          r.uuid,
          reg.set('uuid', r.uuid)
            .set('name', r.name)
            .set('x', r.x)
            .set('y', r.y)
            .set('estateName', r.estateName)
            .set('status', r.status)
            .set('node', r.node)
            .set('isRunning', r.isRunning)
        );
      });
      return state;
    case DELETE_REGION:
      let del = <DeleteRegion>action;
      del.regions.map((uuid: string) => {
        state = state.delete(uuid);
      });
      return state;
    default:
      return state;
  }
}