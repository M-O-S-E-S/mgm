import { Record, Map, Set } from 'immutable'
import { Action } from 'redux'
import { Estate } from '../../Immutable';

const UPDATE_ESTATE = "ESTATES_UPDATE_ESTATE";
const DELETE_ESTATE = "ESTATES_DELETE_ESTATE";

interface Store {
  dispatch(action: UpdateEstate | DeleteEstate): void
}

interface UpdateEstate extends Action {
  estates: Estate[]
}

interface DeleteEstate extends Action {
  estates: number[]
}

export function DispatchUpdateEstate(store: Store, e: Estate | Estate[]): Action {
  if (!e) return;
  store.dispatch(<UpdateEstate>{
    type: UPDATE_ESTATE,
    estates: [].concat(e)
  })
}

export function DispatchDeleteEstate(store: Store, e: number | number[] | Estate | Estate[]): void {
  if (!e) return;
  let estates = [].concat(e);
  if (typeof (estates[0]) === "number") {
    store.dispatch(<DeleteEstate>{
      type: DELETE_ESTATE,
      estates: estates
    });
  } else {
    store.dispatch(<DeleteEstate>{
      type: DELETE_ESTATE,
      estates: estates.map((e: Estate) => { return e.EstateID; })
    });
  }
}

function upsertEstate(state = Map<number, Estate>(), e: Estate): Map<number, Estate> {
  let estate = state.get(e.EstateID, new Estate());
  estate = estate.set('EstateID', e.EstateID)
    .set('EstateName', e.EstateName)
    .set('EstateOwner', e.EstateOwner);
  return state.set(e.EstateID, estate);
}

export function EstatesReducer(state = Map<number, Estate>(), action: Action): Map<number, Estate> {
  let er: Estate;
  switch (action.type) {
    case UPDATE_ESTATE:
      let ea = <UpdateEstate>action;
      ea.estates.map((e: Estate) => {
        let estate = state.get(e.EstateID, new Estate());
        estate = estate.set('EstateID', e.EstateID)
          .set('EstateName', e.EstateName)
          .set('EstateOwner', e.EstateOwner);
        return state.set(e.EstateID, estate);
      })
      return state;
    case DELETE_ESTATE:
      let db = <DeleteEstate>action;
      db.estates.map((id: number) => {
        state = state.delete(id);
      });
      return state;
    default:
      return state
  }
}