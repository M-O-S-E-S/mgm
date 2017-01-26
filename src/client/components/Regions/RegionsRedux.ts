import { Map, Record } from 'immutable';
import { Action } from 'redux';

import { IRegion, IRegionStat } from '../../../common/messages';

const UPSERT_REGION = "REGIONS_UPSERT_REGION";
const UPSERT_REGION_BULK = "REGIONS_UPSERT_REGION_BULK";
const DELETE_REGION = "REGIONS_DELETE_REGION";


const UPSERT_REGIONSTAT = "REGIONS_UPSERT_REGIONSTAT";

interface RegionAction extends Action {
  region: Region
}

interface UpsertRegionBulk extends Action {
  regions: Region[]
}

interface UpsertRegionStat extends Action {
  status: RegionStat
}

const RegionStatClass = Record({
  id: '',
  running: false,
  stats: {
    timestamp: 0,
    uptime: 0,
    memPercent: 0,
    memKB: 0,
    cpuPercent: 0
  }
})

export class RegionStat extends RegionStatClass implements IRegionStat {
  id: string
  running: boolean
  stats: {
    timestamp: number
    uptime: number
    memPercent: number
    memKB: number
    cpuPercent: number
  }
}

const RegionClass = Record({
  uuid: '',
  name: '',
  x: 1000,
  y: 1000,
  estateName: '',
  status: '',
  node: '',
  isRunning: false
})

export class Region extends RegionClass implements IRegion {
  readonly uuid: string
  readonly name: string
  readonly estateName: string
  readonly x: number
  readonly y: number
  readonly node: string
  readonly isRunning: boolean
  readonly status: string

  set(key: string, value: string | number | boolean): Region {
    return <Region>super.set(key, value);
  }
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
    default:
      return state;
  }
}

export const UpsertRegionStatAction = function (r: RegionStat): Action {
  let act: UpsertRegionStat = {
    type: UPSERT_REGIONSTAT,
    status: r
  }
  return act;
}

export const RegionStatsReducer = function (state = Map<string, RegionStat>(), action: Action): Map<string, RegionStat> {
  switch (action.type) {
    case UPSERT_REGIONSTAT:
      let act = <UpsertRegionStat>action;
      return state.set(act.status.id, act.status);
    default:
      return state;
  }
}