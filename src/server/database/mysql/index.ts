
/// <reference path="../../../../typings/index.d.ts" />

import * as Sequelize from 'sequelize';

//HALCYON definitions
import { users, UserInstance, UserAttribute } from './models/halcyon/users';
import { users as pendingUsers, PendingUserInstance, PendingUserAttribute } from './models/mgm/users';
import { avatarAppearance, AvatarAppearanceInstance, AvatarAppearanceAttribute } from './models/halcyon/avatarappearance';
import { inventoryFolders, InventoryFolderInstance, InventoryFolderAttribute } from './models/halcyon/inventoryfolders';
import { inventoryItems, InventoryItemInstance, InventoryItemAttribute } from './models/halcyon/inventoryitems';

import { offlineMessages, OfflineMessageInstance, OfflineMessageAttribute} from './models/mgm/offlineMessages';

import { hosts, HostInstance, HostAttribute } from './models/mgm/hosts';

import { regions, RegionInstance, RegionAttribute } from './models/mgm/regions';

import { osGroup, GroupInstance, GroupAttribute } from './models/halcyon/osgroup';
import { osRole, RoleInstance, RoleAttribute } from './models/halcyon/osrole';
import { osGroupMembership, MembershipInstance, MembershipAttribute } from './models/halcyon/osgroupmembership';

import { estate_settings, EstateInstance, EstateAttribute } from './models/halcyon/estate_settings';
import { estate_map, EstateMapInstance, EstateMapAttribute } from './models/halcyon/estate_map';
import { estate_managers, ManagerInstance, ManagerAttribute } from './models/halcyon/estate_managers';
import { estateban, EstateBanInstance, EstateBanAttribute } from './models/halcyon/estateban';
import { estate_groups, EstateGroupInstance, EstateGroupAttribute } from './models/halcyon/estate_groups';
import { estate_users, EstateUserInstance, EstateUserAttribute } from './models/halcyon/estate_users';

//MGM definitions
import { jobs, JobInstance, JobAttribute } from './models/mgm/jobs';

// Reexport components that other modules touch
export { UserInstance, UserAttribute } from './models/halcyon/users';
export { AvatarAppearanceInstance, AvatarAppearanceAttribute } from './models/halcyon/avatarappearance';
export { JobInstance, JobAttribute } from './models/mgm/jobs';
export { HostInstance, HostAttribute } from './models/mgm/hosts';
export { EstateInstance, EstateAttribute } from './models/halcyon/estate_settings';
export { ManagerInstance, ManagerAttribute } from './models/halcyon/estate_managers';
export { EstateMapInstance, EstateMapAttribute } from './models/halcyon/estate_map';
export { EstateBanInstance, EstateBanAttribute } from './models/halcyon/estateban';
export { EstateGroupInstance, EstateGroupAttribute } from './models/halcyon/estate_groups';
export { EstateUserInstance, EstateUserAttribute } from './models/halcyon/estate_users';
export { GroupInstance, GroupAttribute } from './models/halcyon/osgroup';
export { RoleInstance, RoleAttribute } from './models/halcyon/osrole';
export { MembershipInstance, MembershipAttribute } from './models/halcyon/osgroupmembership';
export { PendingUserInstance, PendingUserAttribute } from './models/mgm/users';
export { RegionInstance, RegionAttribute } from './models/mgm/regions';
export { InventoryFolderInstance, InventoryFolderAttribute } from './models/halcyon/inventoryfolders';
export { InventoryItemInstance, InventoryItemAttribute } from './models/halcyon/inventoryitems';
export { OfflineMessageInstance, OfflineMessageAttribute} from './models/mgm/offlineMessages';

export interface Config {
  host: string
  user: string
  pass: string
  name: string
}

export interface MGMDB {
  hosts: Sequelize.Model<HostInstance, HostAttribute>
  regions: Sequelize.Model<RegionInstance, RegionAttribute>
  pendingUsers: Sequelize.Model<PendingUserInstance, PendingUserAttribute>
  jobs: Sequelize.Model<JobInstance, JobAttribute>
  offlineMessages: Sequelize.Model<OfflineMessageInstance, OfflineMessageAttribute>
}

export interface HALCYONDB {
  users: Sequelize.Model<UserInstance, UserAttribute>
  appearance: Sequelize.Model<AvatarAppearanceInstance, AvatarAppearanceAttribute>
  inventoryItems: Sequelize.Model<InventoryItemInstance, InventoryItemAttribute>
  inventoryFolders: Sequelize.Model<InventoryFolderInstance, InventoryFolderAttribute>
  groups: Sequelize.Model<GroupInstance, GroupAttribute>
  roles: Sequelize.Model<RoleInstance, RoleAttribute>
  members: Sequelize.Model<MembershipInstance, MembershipAttribute>
  estates: Sequelize.Model<EstateInstance, EstateAttribute>
  managers: Sequelize.Model<ManagerInstance, ManagerAttribute>
  estateMap: Sequelize.Model<EstateMapInstance, EstateMapAttribute>
  estateBan: Sequelize.Model<EstateBanInstance, EstateBanAttribute>
  estateGroups: Sequelize.Model<EstateGroupInstance, EstateGroupAttribute>
  estateUsers: Sequelize.Model<EstateUserInstance, EstateUserAttribute>
}

export class Sql {

  static connectMGM(conf: Config): MGMDB {
    let seq = new Sequelize(conf.name, conf.user, conf.pass, {
      host: conf.host,
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      logging: false
    });

    return {
      hosts: seq.import('hosts', hosts),
      regions: seq.import('regions', regions),
      pendingUsers: seq.import('users', pendingUsers),
      jobs: seq.import('jobs', jobs),
      offlineMessages: seq.import('offlineMessages', offlineMessages)
    };
  }

  static connectHalcyon(conf: Config): HALCYONDB {
    let seq = new Sequelize(conf.name, conf.user, conf.pass, {
      host: conf.host,
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      logging: false
    });

    return {
      users: seq.import('users', users),
      inventoryItems: seq.import('inventoryitems', inventoryItems),
      inventoryFolders: seq.import('inventoryfolders', inventoryFolders),
      appearance: seq.import('avatarappearance', avatarAppearance),
      groups: seq.import('osgroup', osGroup),
      roles: seq.import('osrole', osRole),
      members: seq.import('osgroupmembership', osGroupMembership),
      estates: seq.import('estate_settings', estate_settings),
      managers: seq.import('estate_managers', estate_managers),
      estateMap: seq.import('estate_map', estate_map),
      estateBan: seq.import('estateban', estateban),
      estateGroups: seq.import('estate_groups', estate_groups),
      estateUsers: seq.import('estate_users', estate_users)
    };
  }
}
