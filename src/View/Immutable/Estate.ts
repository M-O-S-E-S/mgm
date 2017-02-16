import { Record } from 'immutable';
import { IEstate } from '../../Store';

const EstateClass = Record({
  EstateID: 0,
  EstateName: '',
  EstateOwner: '',
})

export class Estate extends EstateClass implements IEstate {
  EstateID: number
  EstateName: string
  EstateOwner: string

  set(key: string, value: string | number): Estate {
    return <Estate>super.set(key, value);
  }
}