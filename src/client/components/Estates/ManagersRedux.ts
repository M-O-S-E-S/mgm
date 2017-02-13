import { Map, Set } from 'immutable';
import { Action } from 'redux';
import { ESTATE_DELETED, EstateDeletedAction } from './EstatesRedux';
import { IManager } from '../../../common/messages';

const UPSERT_MANAGER = "ESTATES_UPSERT_MANAGER";
const UPSERT_MANAGER_BULK = "ESTATES_UPSERT_MANAGER_BULK";
const DELETE_MANAGER_BULK = "ESTATES_DELETE_MANAGER_BULK";

interface ManagerAction extends Action {
  manager: IManager
}

interface ManagerBulkAction extends Action {
  managers: IManager[]
}

interface ManagerDeletedBulkAction extends Action {
  managers: number[]
}

export const UpsertManagerAction = function (m: IManager): Action {
  let act: ManagerAction = {
    type: UPSERT_MANAGER,
    manager: m
  }
  return act;
}

export const UpsertManagerBulkAction = function (m: IManager[]): Action {
  let act: ManagerBulkAction = {
    type: UPSERT_MANAGER_BULK,
    managers: m
  }
  return act;
}

export const DeleteManagerBulkAction = function (m: number[]): Action {
  let act: ManagerDeletedBulkAction = {
    type: DELETE_MANAGER_BULK,
    managers: m
  }
  return act;
}

function upsertManager(state = Map<number, Set<string>>(), m: IManager): Map<number, Set<string>> {
  let managers = state.get(m.estate, Set<string>());
  managers = managers.add(m.uuid);
  return state.set(m.estate, managers);
}

export const ManagersReducer = function (state = Map<number, Set<string>>(), action: Action): Map<number, Set<string>> {
  switch (action.type) {
    case UPSERT_MANAGER:
      let ma = <ManagerAction>action;
      return upsertManager(state, ma.manager);
    case UPSERT_MANAGER_BULK:
      let eb = <ManagerBulkAction>action;
      eb.managers.map((e: IManager) => {
        state = upsertManager(state, e);
      });
      return state;
    case DELETE_MANAGER_BULK:
      let db = <ManagerDeletedBulkAction>action;
      db.managers.map((m: number) => {
        state = state.delete(m);
      });
      return state;
    case ESTATE_DELETED:
      let da = <EstateDeletedAction>action;
      return state.delete(da.id);
    default:
      return state
  }
}