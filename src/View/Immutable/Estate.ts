import { Record } from 'immutable';
import { IEstate } from '../../Types';

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


import { IManager } from '../../Types';

const ManagerClass = Record({
  EstateID: 0,
  uuid: ''
})

export class Manager extends ManagerClass implements IManager {
  EstateID: number
  uuid: string

  set(key: string, value: string | number): Manager {
    return <Manager>super.set(key, value);
  }
}

import { IEstateMap } from '../../Types';

const EstateMapClass = Record({
  EstateID: 0,
  RegionID: ''
})

export class EstateMap extends EstateMapClass implements IEstateMap {
  EstateID: number
  RegionID: string

  set(key: string, value: string | number): EstateMap {
    return <EstateMap>super.set(key, value);
  }
}