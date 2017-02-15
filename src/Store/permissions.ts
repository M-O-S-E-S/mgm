
import { User, Estate, Manager, EstateMap } from '.';
import { UserDetail } from '../Auth';

import { Set } from 'immutable';
import { Store } from '.';

/**
 * Generate a UserDetail for a given UUID.
 * User validity and suspension is also checked here, as this is used more often than in Auth.
 */
export function GetUserPermissions(store: Store, uuid: string): Promise<UserDetail> {
  let user: User;
  let isAdmin: boolean = false;
  let allowEstates = Set<number>();
  let allowRegions = Set<string>();
  return store.Users.getByID(uuid)
    .then((u: User) => {
      if (!u || u.isSuspended())
        throw new Error('Invalid user for permissions');
      if (u.isAdmin())
        isAdmin = true;
      user = u;
      return store.Estates.getAll();
    }).then((estates: Estate[]) => {
      estates.map((e: Estate) => {
        if (isAdmin || e.EstateOwner === user.UUID)
          allowEstates = allowEstates.add(e.EstateID);
      });
      return store.Estates.getManagers();
    }).then((managers: Manager[]) => {
      managers.map((manager: Manager) => {
        if (manager.uuid === user.UUID)
          allowEstates = allowEstates.add(manager.EstateID);
      });
      return store.Estates.getMapping();
    }).then((mapping: EstateMap[]) => {
      mapping.map((emap: EstateMap) => {
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