import { Map, Set } from 'immutable';
import { Action } from 'redux';
import { Manager, Estate } from '../../Immutable';

const UPDATE_MANAGER = "ESTATES_UPDATE_MANAGER";
const DELETE_MANAGER = "ESTATES_DELETE_MANAGER";

interface Store {
  dispatch(action: UpdateManager | DeleteManager): void
}

interface UpdateManager extends Action {
  managers: Manager[]
}

interface DeleteManager extends Action {
  group: number
  managers: string[]
}

export function DispatchUpdateManager(store: Store, m: Manager | Manager[]): Action {
  if (!m) return;
  store.dispatch(<UpdateManager>{
    type: UPDATE_MANAGER,
    managers: [].concat(m)
  });
}

export function DispatchDeleteManager(store: Store, e: number | Estate, m: Manager | Manager[] | string | string[]): Action {
  if (!e || !m) return;
  let estate = 0;
  if (typeof (e) === "number") {
    estate = e;
  } else {
    estate = e.EstateID;
  }
  let managers = [].concat(m);
  if (typeof (managers[0]) === "string") {
    store.dispatch(<DeleteManager>{
      type: DELETE_MANAGER,
      managers: managers
    });
  } else {
    store.dispatch(<DeleteManager>{
      type: DELETE_MANAGER,
      managers: managers.map((m: Manager) => { return m.uuid; })
    });
  }
}

export function ManagersReducer(state = Map<number, Set<string>>(), action: Action): Map<number, Set<string>> {
  switch (action.type) {
    case UPDATE_MANAGER:
      let update = <UpdateManager>action;
      update.managers.map((m: Manager) => {
        let managers = state.get(m.EstateID, Set<string>());
        managers = managers.add(m.uuid);
        state = state.set(m.EstateID, managers);
      });
      return state;
    case DELETE_MANAGER:
      let db = <DeleteManager>action;
      let managers = state.get(db.group, Set<string>());
      db.managers.map((m: string) => {
        managers = managers.delete(m);
      });
      return state.set(db.group, managers);
    default:
      return state;
  }
}