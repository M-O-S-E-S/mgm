import { Map, Record } from 'immutable';
import { Action } from 'redux';
import { Region } from '../../Immutable';

const UPSERT_REGION = "REGIONS_UPSERT_REGION";
const UPSERT_REGION_BULK = "REGIONS_UPSERT_REGION_BULK";
const DELETE_REGION = "REGIONS_DELETE_REGION";
const DELETE_REGION_BULK = "REGIONS_DELETE_REGION_BULK";


const UPSERT_REGIONSTAT = "REGIONS_UPSERT_REGIONSTAT";

interface RegionAction extends Action {
  region: Region
}

interface UpsertRegionBulk extends Action {
  regions: Region[]
}

interface DeleteRegionBulk extends Action {
  regions: string[]
}

export const UpsertRegionAction = function (r: Region): Action {
  let act: RegionAction = {
    type: UPSERT_REGION,
    region: r
  }
  return act;
}

export const UpsertRegionBulkAction = function (r: Region[]): Action {
  let act: UpsertRegionBulk = {
    type: UPSERT_REGION_BULK,
    regions: r
  }
  return act;
}

export const DeleteRegionAction = function (r: Region): Action {
  let act: RegionAction = {
    type: DELETE_REGION,
    region: r
  }
  return act
}

export const DeleteRegionBulkAction = function(r: string[]): Action {
  let act: DeleteRegionBulk = {
    type: DELETE_REGION_BULK,
    regions: r
  }
  return act;
}

// internal function to update the state with a single user
function upsertRegion(state: Map<string, Region>, r: Region): Map<string, Region> {
  let rec = state.get(r.uuid, new Region());
  return state.set(
    r.uuid,
    rec.set('uuid', r.uuid)
      .set('name', r.name)
      .set('x', r.x)
      .set('y', r.y)
      .set('estateName', r.estateName)
      .set('status', r.status)
      .set('node', r.node)
      .set('isRunning', r.isRunning)
  );
}

export const RegionsReducer = function (state = Map<string, Region>(), action: Action): Map<string, Region> {
  switch (action.type) {
    case UPSERT_REGION:
      let act = <RegionAction>action;
      console.log('upserting single region');
      console.log(act.region);
      return upsertRegion(state, act.region);
    case UPSERT_REGION_BULK:
      let urb = <UpsertRegionBulk>action;
      urb.regions.map((r: Region) => {
        state = upsertRegion(state, r);
      })
      return state;
    case DELETE_REGION:
      act = <RegionAction>action;
      return state.remove(act.region.uuid);
    case DELETE_REGION_BULK:
     let da = <DeleteRegionBulk>action;
     da.regions.map( (r: string) => {
       state = state.delete(r);
     })
     return state;
    default:
      return state;
  }
}