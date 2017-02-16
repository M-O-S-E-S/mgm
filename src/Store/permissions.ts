
import { IUser, IEstate, IManager, IEstateMap } from '.';
import { UserDetail } from '../Auth';

import { Set } from 'immutable';
import { Store } from '.';

/**
 * Generate a UserDetail for a given UUID.
 * User validity and suspension is also checked here, as this is used more often than in Auth.
 */
export function GetUserPermissions(store: Store, uuid: string): Promise<UserDetail> {
  let user: IUser;
  let isAdmin: boolean = false;
  let allowEstates = Set<number>();
  let allowRegions = Set<string>();
  return store.Users.getByID(uuid)
    .then((u: IUser) => {
      if (!u || u.isSuspended())
        throw new Error('Invalid user for permissions');
      if (u.isAdmin())
        isAdmin = true;
      user = u;
      return store.Estates.getAll();
    }).then((estates: IEstate[]) => {
      estates.map((e: IEstate) => {
        if (isAdmin || e.EstateOwner === user.UUID)
          allowEstates = allowEstates.add(e.EstateID);
      });
      return store.Estates.getManagers();
    }).then((managers: IManager[]) => {
      managers.map((manager: IManager) => {
        if (manager.uuid === user.UUID)
          allowEstates = allowEstates.add(manager.EstateID);
      });
      return store.Estates.getMapping();
    }).then((mapping: IEstateMap[]) => {
      mapping.map((emap: IEstateMap) => {
        if (allowEstates.contains(emap.EstateID))
          allowRegions = allowRegions.add(emap.RegionID);
      });
    }).then(() => {
      return {
        uuid: user.UUID,
        name: user.name(),
        isAdmin: user.isAdmin(),
        email: user.email,
        estates: allowEstates,
        regions: allowRegions
      }
    });
}