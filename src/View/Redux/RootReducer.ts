import { Action } from 'redux';
import { Record, Map, Set } from 'immutable';

import { Member, Role, Manager, EstateMap } from '../Immutable'
import { StateModel } from './model';

import { UsersReducer } from './Users';
import { RegionsReducer } from './Regions';
import { HostsReducer } from './Hosts';
import { EstatesReducer } from './Estates';
import { ManagersReducer } from './Managers';
import { EstateMapReducer } from './EstateMap';
import { GroupsReducer } from './Groups';
import { MembersReducer } from './Members';
import { RolesReducer } from './Roles';
import { PendingUsersReducer } from './PendingUsers';
import { JobsReducer } from './Jobs';

import { NavReducer } from './reducers/nav';
import { APP_LOGOUT, AuthReducer } from './reducers/auth';

export default function rootReducer(state = new StateModel(), action: Action): StateModel {
  switch (action.type) {
    case APP_LOGOUT:
      // if we are logging out, wipe all state
      return new StateModel();
    default:
      return state
        .set('auth', AuthReducer(state.auth, action))
        .set('url', NavReducer(state.url, action))
        .set('hosts', HostsReducer(state.hosts, action))
        .set('regions', RegionsReducer(state.regions, action))
        .set('estateMap', EstateMapReducer(state.estateMap, action))
        .set('users', UsersReducer(state.users, action))
        .set('pendingUsers', PendingUsersReducer(state.pendingUsers, action))
        .set('groups', GroupsReducer(state.groups, action))
        .set('roles', RolesReducer(state.roles, action))
        .set('members', MembersReducer(state.members, action))
        .set('estates', EstatesReducer(state.estates, action))
        .set('managers', ManagersReducer(state.managers, action))
        .set('jobs', JobsReducer(state.jobs, action));
  }

}