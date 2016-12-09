import { Store } from 'redux';
import { StateModel } from '../redux/model';
import { get } from './network';

import { IRegion, IEstate, IGroup, IMembership, IRole, IHost } from '../../common/messages';

import { Region, UpsertRegionAction } from '../components/Regions';
import { Estate, UpsertEstateAction } from '../components/Estates';
import {
  Group, UpsertGroupAction,
  UpsertMemberAction,
  Role, UpsertRoleAction
} from '../components/Groups';
import { Host, UpsertHostAction } from '../components/Hosts';

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

interface groupResult extends NetworkResult {
  Groups: IGroup[]
  Members: IMembership[]
  Roles: IRole[]
}

interface hostResult extends NetworkResult {
  Hosts: IHost[]
}

export class Synchroniser {
  private store: Store<StateModel>

  constructor(store: Store<StateModel>) {
    this.store = store;
  }

  sync() {
    this.regions();
    this.estates();
    this.groups();
    this.hosts();
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
      res.Estates.map((r: IEstate) => {
        this.store.dispatch(UpsertEstateAction(new Estate(r)))
      });
    });
  }

  private groups() {
    get('/api/group').then((res: groupResult) => {
      if (!res.Success) return;
      res.Groups.map((r: IGroup) => {
        this.store.dispatch(UpsertGroupAction(new Group(r)));
      });
      res.Members.map((m: IMembership) => {
        this.store.dispatch(UpsertMemberAction(m));
      })
      res.Roles.map((r: IRole) => {
        this.store.dispatch(UpsertRoleAction(new Role(r)));
      })
    });
  }

  private hosts() {
    get('/api/host').then((res: hostResult) => {
      if (!res.Success) return;
      res.Hosts.map( (h: IHost) => {
        this.store.dispatch(UpsertHostAction(new Host(h)));
      })
    });
  }

}