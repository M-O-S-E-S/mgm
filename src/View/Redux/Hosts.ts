import { Record, Map } from 'immutable';
import { Action } from 'redux';
import { Host } from '../Immutable';

const UPSERT_HOST = 'HOSTS_UPSERT_HOST';
const UPSERT_HOST_BULK = 'HOSTS_UPSERT_HOST_BULK';
const HOST_DELETED = 'HOSTS_HOST_DELETED';
const UPSERT_HOSTSTAT = 'HOSTS_UPSERT_HOSTSTAT';
const HOST_DELETED_BULK = 'HOSTS_HOST_DELETED_BULK';

interface UpsertHost extends Action {
  host: Host
}

interface UpsertHostBulk extends Action {
  hosts: Host[]
}


export interface HostDeletedAction extends Action {
  id: number
}

export interface HostDeletedBulkAction extends Action {
  hosts: number[]
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
