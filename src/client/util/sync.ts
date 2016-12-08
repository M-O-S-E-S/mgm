import { Store } from 'redux';
import { StateModel } from '../redux/model';
import { get } from './network';

import { IRegion, IEstate } from '../../common/messages';

import { Region, UpsertRegionAction } from '../components/Regions';
import { Estate, UpsertEstateAction } from '../components/Estates';

interface NetworkResult {
  Success: Boolean
  Message?: string
}
interface regionResult extends NetworkResult {
  Regions: IRegion[]
}

interface estateResult extends NetworkResult {
  Estates: IEstate[]
}

export class Synchroniser {
  private store: Store<StateModel>

  constructor(store: Store<StateModel>) {
    this.store = store;
  }

  sync() {
    this.regions();
    this.estates();
  }



  private regions() {
    get('/api/region').then((res: regionResult) => {
      if (!res.Success) return;
      res.Regions.map((r: IRegion) => {
        this.store.dispatch(UpsertRegionAction(new Region(r)))
      });
    });
  }

  private estates() {
    get('/api/estate').then((res: estateResult) => {
      if (!res.Success) return;
      console.log(res);
      res.Estates.map((r: IEstate) => {
        this.store.dispatch(UpsertEstateAction(new Estate(r)))
      });
    });
  }

}