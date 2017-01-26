import { Record, Map, Set } from 'immutable'
import { Action } from 'redux'
import { IEstate } from '../../../common/messages'

export const ESTATE_DELETED = "ESTATES_ESTATE_DELETED";
const UPSERT_ESTATE = "ESTATES_UPSERT_ESTATE";
const UPSERT_ESTATE_BULK = "ESTATES_UPSERT_BULK";

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

interface EstateBulkAction extends Action {
  estates: Estate[]
}

export interface EstateDeletedAction extends Action {
  id: number
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

function upsertEstate(state = Map<number, Estate>(), e: IEstate): Map<number, Estate> {
  let estate = state.get(e.id, new Estate());
  estate = estate.set('id', e.id)
    .set('name', e.name)
    .set('owner', e.owner);
  return state.set(e.id, estate);
}

export const EstatesReducer = function (state = Map<number, Estate>(), action: Action): Map<number, Estate> {
  let er: Estate;
  switch (action.type) {
    case UPSERT_ESTATE:
      let ea = <EstateAction>action;
      return upsertEstate(state, ea.estate);
    case UPSERT_ESTATE_BULK:
      let eb = <EstateBulkAction>action;
      eb.estates.map((e: IEstate) => {
        state = upsertEstate(state, e);
      })
      return state;
    case ESTATE_DELETED:
      let da = <EstateDeletedAction>action;
      return state.delete(da.id);
    default:
      return state
  }
}