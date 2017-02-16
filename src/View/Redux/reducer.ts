import { Action } from 'redux';
import { Record, Map, Set } from 'immutable';

import { IMembership, IRole, IManager, IEstateMap } from '../../common/messages'
import { StateModel, Auth } from './model';

import { UsersReducer } from '../components/Users';
import { RegionsReducer, RegionStatsReducer } from '../components/Regions';
import { HostsReducer, HostStatReducer } from '../components/Hosts';
import { EstatesReducer, ManagersReducer, EstateMapReducer } from '../components/Estates';
import { GroupsReducer, MembersReducer, RolesReducer } from '../components/Groups';
import { PendingUsersReducer } from '../components/PendingUsers';
import { JobsReducer } from '../components/Account';


import {
  NavigateTo,
  LoginAction,
  SetAuthMessage,

  APP_LOGIN,
  APP_LOGOUT,
  APP_AUTH_ERROR,
  APP_NAV_TO
} from './actions';

function auth(state = new Auth(), action: Action): Auth {
  switch (action.type) {
    case APP_LOGIN:
      let act = <LoginAction>action;
      return state
        .set('loggedIn', true)
        .set('errorMsg', '')
        .set('user', act.user)
        .set('isAdmin', act.isAdmin)
        .set('token', act.token);
    case APP_AUTH_ERROR:
      let aca = <SetAuthMessage>action;
      return state
        .set('loggedIn', false)
        .set('user', null)
        .set('token', null)
        .set('isAdmin', false)
        .set('errorMsg', aca.message);
    default: return state;
  }
}

function url(state = "/", action: Action) {
  switch (action.type) {
    case APP_NAV_TO:
      let act = <NavigateTo>action;
      if (act.url === state) return state;
      return act.url
    default:
      return state;
  }
}

export default function rootReducer(state = new StateModel(), action: Action): StateModel {
  switch (action.type) {
    case APP_LOGOUT:
      return new StateModel();
    default:
      return state
        .set('auth', auth(state.auth, action))
        .set('url', url(state.url, action))
        .set('hosts', HostsReducer(state.hosts, action))
        .set('hostStats', HostStatReducer(state.hostStats, action))
        .set('regions', RegionsReducer(state.regions, action))
        .set('regionStats', RegionStatsReducer(state.regionStats, action))
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