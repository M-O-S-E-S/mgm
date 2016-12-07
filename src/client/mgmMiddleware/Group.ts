import { Action, Dispatch, Middleware, Store } from 'redux';
import { StateModel } from '../redux/model'
import { Connection } from './Connection';
import { MessageTypes } from '../../common/MessageTypes';
import { IGroup, IMembership, IRole } from '../../common/messages'
import { Role, Group, CreateGroupAction, CreateMemberAction, CreateRoleAction } from '../components/Groups'


export function handleGroupMessages(store: Store<StateModel>) {
  Connection.instance().sock.on(MessageTypes.ADD_GROUP, (group: IGroup) => {
    store.dispatch(CreateGroupAction(new Group(group)));
  })
  Connection.instance().sock.on(MessageTypes.ADD_ROLE, (role: IRole) => {
    store.dispatch(CreateRoleAction(new Role(role)));
  })
  Connection.instance().sock.on(MessageTypes.ADD_MEMBER, (member: IMembership) => {
    store.dispatch(CreateMemberAction(member));
  })
}