import { Record, Map } from 'immutable';
import { Action } from 'redux';
import { Host } from '../../Immutable';

const UPDATE_HOST = 'HOSTS_UPDATE_HOST';
const DELETE_HOST = 'HOSTS_DELETE_HOST';

interface Store {
  dispatch(action: UpdateHost | DeleteHost): void
}

interface UpdateHost extends Action {
  hosts: Host[]
}

interface DeleteHost extends Action {
  hosts: number[]
}

export function DispatchUpdateHost(store: Store, h: Host | Host[]): void {
  if (!h) return;
  store.dispatch(<UpdateHost>{
    type: UPDATE_HOST,
    hosts: [].concat(h)
  });
}

export function DispatchDeleteHost(store: Store, h: Host | Host[] | number | number[]): void {
  if (!h) return;
  let hosts = [].concat(h);
  if (typeof (hosts[0]) === "number") {
    store.dispatch(<DeleteHost>{
      type: DELETE_HOST,
      hosts: hosts
    });
  } else {
    store.dispatch(<DeleteHost>{
      type: DELETE_HOST,
      hosts: hosts.map((h: Host) => { return h.id; })
    });
  }
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

export function HostsReducer(state = Map<number, Host>(), action: Action): Map<number, Host> {
  switch (action.type) {
    case UPDATE_HOST:
      let update = <UpdateHost>action;
      update.hosts.map((h: Host) => {
        let host = state.get(h.id, new Host());
        state = state.set(
          h.id,
          host.set('id', h.id)
            .set('address', h.address)
            .set('name', h.name)
            .set('port', h.port)
            .set('slots', h.slots)
            .set('status', h.status)
        );
      });
      return state;
    case DELETE_HOST:
      let del = <DeleteHost>action;
      del.hosts.map((id: number) => {
        state = state.delete(id);
      });
      return state;
    default:
      return state;
  }
}
