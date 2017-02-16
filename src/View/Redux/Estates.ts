import { Record, Map, Set } from 'immutable'
import { Action } from 'redux'
import { Estate } from '../Immutable';

export const ESTATE_DELETED = "ESTATES_ESTATE_DELETED";
const UPSERT_ESTATE = "ESTATES_UPSERT_ESTATE";
const UPSERT_ESTATE_BULK = "ESTATES_UPSERT_BULK";
const DELETE_ESTATE_BULK = "ESTATES_DELETE_BULK";

interface EstateAction extends Action {
  estate: Estate
}

interface EstateBulkAction extends Action {
  estates: Estate[]
}

export interface EstateDeletedAction extends Action {
  id: number
}

interface EstateDeletedBulkAction extends Action {
  estates: number[]
}

export const UpsertEstateAction = function (e: Estate): Action {
  let act: EstateAction = {
    type: UPSERT_ESTATE,
    estate: e
  }
  return act;
}

export const UpsertEstateBulkAction = function (e: Estate[]): Action {
  let act: EstateBulkAction = {
    type: UPSERT_ESTATE_BULK,
    estates: e
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

export const DeleteEstateBulkAction = function (e: number[]): Action {
  let act: EstateDeletedBulkAction = {
    type: DELETE_ESTATE_BULK,
    estates: e
  }
  return act;
}

function upsertEstate(state = Map<number, Estate>(), e: Estate): Map<number, Estate> {
  let estate = state.get(e.EstateID, new Estate());
  estate = estate.set('EstateID', e.EstateID)
    .set('EstateName', e.EstateName)
    .set('EstateOwner', e.EstateOwner);
  return state.set(e.EstateID, estate);
}

export const EstatesReducer = function (state = Map<number, Estate>(), action: Action): Map<number, Estate> {
  let er: Estate;
  switch (action.type) {
    case UPSERT_ESTATE:
      let ea = <EstateAction>action;
      return upsertEstate(state, ea.estate);
    case UPSERT_ESTATE_BULK:
      let eb = <EstateBulkAction>action;
      eb.estates.map((e: Estate) => {
        state = upsertEstate(state, e);
      })
      return state;
    case ESTATE_DELETED:
      let da = <EstateDeletedAction>action;
      return state.delete(da.id);
    case DELETE_ESTATE_BULK:
      let db = <EstateDeletedBulkAction>action;
      db.estates.map((id: number) => {
        state = state.delete(id);
      });
      return state;
    default:
      return state
  }
}