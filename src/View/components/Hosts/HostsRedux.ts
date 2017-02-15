import { Record, Map } from 'immutable';
import { Action } from 'redux';
import { IHost, IHostStat } from '../../../common/messages';

const UPSERT_HOST = 'HOSTS_UPSERT_HOST';
const UPSERT_HOST_BULK = 'HOSTS_UPSERT_HOST_BULK';
const HOST_DELETED = 'HOSTS_HOST_DELETED';
const UPSERT_HOSTSTAT = 'HOSTS_UPSERT_HOSTSTAT';
const HOST_DELETED_BULK = 'HOSTS_HOST_DELETED_BULK';

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

interface UpsertHostBulk extends Action {
  hosts: Host[]
}

interface UpsertHostStat extends Action {
  host: number
  hostStat: HostStat
}

export interface HostDeletedAction extends Action {
  id: number
}

export interface HostDeletedBulkAction extends Action {
  hosts: number[]
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

export const UpsertHostBulkAction = function (h: Host[]): Action {
  let act: UpsertHostBulk = {
    type: UPSERT_HOST_BULK,
    hosts: h
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

export const DeleteHostBulkAction = function (h: number[]): Action {
  let act: HostDeletedBulkAction = {
    type: HOST_DELETED_BULK,
    hosts: h
  }
  return act;
}

function upsertHost(state: Map<number, Host>, h: Host): Map<number, Host> {
  let host = state.get(h.id, new Host());
  host = host.set('id', h.id)
    .set('address', h.address)
    .set('name', h.name)
    .set('port', h.port)
    .set('slots', h.slots)
    .set('status', h.status);
  return state.set(h.id, host);
}

export const HostsReducer = function (state = Map<number, Host>(), action: Action): Map<number, Host> {
  switch (action.type) {
    case UPSERT_HOST:
      let act = <UpsertHost>action;
      return upsertHost(state, act.host);
    case UPSERT_HOST_BULK:
      let uhb = <UpsertHostBulk>action;
      uhb.hosts.map((h: Host) => {
        state = upsertHost(state, h);
      })
      return state;
    case HOST_DELETED:
      let rmvr = <HostDeletedAction>action;
      return state.delete(rmvr.id);
    case HOST_DELETED_BULK:
      let db = <HostDeletedBulkAction>action;
      db.hosts.map((h) => {
        state = state.delete(h);
      });
      return state;
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