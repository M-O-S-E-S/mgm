import { Map, Set } from 'immutable';
import { Action } from 'redux';
import { ESTATE_DELETED, EstateDeletedAction } from './EstatesRedux';
import { IManager } from '../../../common/messages';

const ADD_MANAGER = "ESTATES_ADD_MANAGER";

interface ManagerAction extends Action {
  manager: IManager
}

export const CreateManagerAction = function(m: IManager): Action {
  let act: ManagerAction = {
    type: ADD_MANAGER,
    manager: m
  }
  return act;
}

export const ManagersReducer = function(state = Map<number, Set<string>>(), action: Action): Map<number, Set<string>> {
  switch (action.type) {
    case ADD_MANAGER:
      let ma = <ManagerAction>action;
      let managers = state.get(ma.manager.EstateId) || Set<string>()
      return state.set(ma.manager.EstateId, managers.add(ma.manager.uuid))
    case ESTATE_DELETED:
      let da = <EstateDeletedAction>action;
      return state.delete(da.id);
    default:
      return state
  }
}