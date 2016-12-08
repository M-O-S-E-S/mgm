import { Record, Map, Set } from 'immutable'
import { Action } from 'redux'
import { IEstate } from '../../../common/messages'

export const ESTATE_DELETED = "ESTATES_ESTATE_DELETED";
const ADD_ESTATE = "ESTATES_ADD_ESTATE";

const EstateClass = Record({
  id: 0,
  name: '',
  owner: '',
})

export class Estate extends EstateClass implements IEstate {
  id: number
  name: string
  owner: string

  set(key: string, value: string | number): Estate {
    return <Estate>super.set(key, value);
  }
}

interface EstateAction extends Action {
  estate: Estate
}

export interface EstateDeletedAction extends Action {
  id: number
}

export const UpsertEstateAction = function (e: Estate): Action {
  let act: EstateAction = {
    type: ADD_ESTATE,
    estate: e
  }
  return act;
}

export const EstateDeletedAction = function (id: number): Action {
  let act: EstateDeletedAction = {
    type: ESTATE_DELETED,
    id: id
  }
  return act
}

export const EstatesReducer = function (state = Map<number, Estate>(), action: Action): Map<number, Estate> {
  let er: Estate;
  switch (action.type) {
    case ADD_ESTATE:
      let ea = <EstateAction>action;
      er = state.get(ea.estate.id) || ea.estate
      return state.set(ea.estate.id, er);
    case ESTATE_DELETED:
      let da = <EstateDeletedAction>action;
      return state.delete(da.id);
    default:
      return state
  }
}