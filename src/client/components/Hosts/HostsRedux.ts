import { Record, Map } from 'immutable';
import { Action } from 'redux';
import { IHost, IHostStat } from '../../../common/messages';

const UPSERT_HOST = 'HOSTS_UPSERT_HOST';
const HOST_DELETED = 'HOSTS_HOST_DELETED';
const UPSERT_HOSTSTAT = 'HOSTS_UPSERT_HOSTSTAT';

const HostClass = Record({
  id: 0,
  address: '',
  port: 0,
  name: '',
  slots: 0,
  status: ''
})

export class Host extends HostClass implements IHost {
  id: number
  address: string
  port: number
  name: string
  slots: number
  status: string

  set(key: string, value: string | number): Host {
    return <Host>super.set(key, value);
  }
}

const HostStatClass = Record({
  memPercent: 0,
  memKB: 0,
  cpuPercent: [],
  timestamp: 0,
  netSentPer: 0,
  netRecvPer: 0
})

export class HostStat extends HostStatClass implements IHostStat {
  memPercent: number
  memKB: number
  cpuPercent: number[]
  timestamp: number
  netSentPer: number
  netRecvPer: number
}

interface UpsertHost extends Action {
  host: Host
}

interface UpsertHostStat extends Action {
  host: number
  hostStat: HostStat
}

export interface HostDeletedAction extends Action {
  id: number
}

export const UpsertHostStatAction = function (h: number, s: HostStat): Action {
  let act: UpsertHostStat = {
    type: UPSERT_HOSTSTAT,
    host: h,
    hostStat: s
  }
  return act;
}

export const UpsertHostAction = function (h: Host): Action {
  let act: UpsertHost = {
    type: UPSERT_HOST,
    host: h
  }
  return act;
}

export const HostDeletedAction = function (id: number): Action {
  let act: HostDeletedAction = {
    type: HOST_DELETED,
    id: id
  }
  return act;
}

export const HostsReducer = function (state = Map<number, Host>(), action: Action): Map<number, Host> {
  switch (action.type) {
    case UPSERT_HOST:
      let act = <UpsertHost>action;
      return state.set(act.host.id, act.host);
    case HOST_DELETED:
      let rmvr = <HostDeletedAction>action;
      return state.delete(rmvr.id);
    default:
      return state;
  }
}

export const HostStatReducer = function (state = Map<number, HostStat>(), action: Action): Map<number, HostStat> {
  switch (action.type) {
    case UPSERT_HOSTSTAT:
      let act = <UpsertHostStat>action;
      return state.set(act.host, act.hostStat);
    default:
      return state;
  }
}