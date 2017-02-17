import { Map, Set } from 'immutable';
import { Action } from 'redux';
import { Manager } from '../Immutable';

const UPSERT_MANAGER = "ESTATES_UPSERT_MANAGER";
const UPSERT_MANAGER_BULK = "ESTATES_UPSERT_MANAGER_BULK";
const DELETE_MANAGER_BULK = "ESTATES_DELETE_MANAGER_BULK";

interface ManagerAction extends Action {
  manager: Manager
}

interface ManagerBulkAction extends Action {
  managers: Manager[]
}

interface ManagerDeletedBulkAction extends Action {
  group: number
  managers: string[]
}

export const UpsertManagerAction = function (m: Manager): Action {
  let act: ManagerAction = {
    type: UPSERT_MANAGER,
    manager: m
  }
  return act;
}

export const UpsertManagerBulkAction = function (m: Manager[]): Action {
  let act: ManagerBulkAction = {
    type: UPSERT_MANAGER_BULK,
    managers: m
  }
  return act;
}

export const DeleteManagerBulkAction = function (g: number, m: string[]): Action {
  let act: ManagerDeletedBulkAction = {
    type: DELETE_MANAGER_BULK,
    group: g,
    managers: m
  }
  return act;
}

function upsertManager(state = Map<number, Set<string>>(), m: Manager): Map<number, Set<string>> {
  let managers = state.get(m.EstateID, Set<string>());
  managers = managers.add(m.uuid);
  return state.set(m.EstateID, managers);
}

export const ManagersReducer = function (state = Map<number, Set<string>>(), action: Action): Map<number, Set<string>> {
  switch (action.type) {
    case UPSERT_MANAGER:
      let ma = <ManagerAction>action;
      return upsertManager(state, ma.manager);
    case UPSERT_MANAGER_BULK:
      let eb = <ManagerBulkAction>action;
      eb.managers.map((e: Manager) => {
        state = upsertManager(state, e);
      });
      return state;
    case DELETE_MANAGER_BULK:
      let db = <ManagerDeletedBulkAction>action;
      let managers = state.get(db.group, Set<string>());
      db.managers.map((m: string) => {
        managers = managers.delete(m);
      });
      return state.set(db.group, managers);
    default:
      return state
  }
}