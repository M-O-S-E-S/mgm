import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { UserView } from './UserView';
import { User } from '.';
import { Group, Role } from '../Groups';
import { AddUserModal } from './AddUserModal';
import { ManageUserModal } from './ManageUserModal';
import { ManageGroupsModal } from './ManageGroupsModal';

import { Grid, Row, Col, Button } from 'react-bootstrap'

interface props {
    dispatch: (a: Action) => void,
    users: Map<string, User>,
    groups: Map<string, Group>,
    members: Map<string, Map<string, string>>,
    roles: Map<string, Map<string, Role>>,
    isAdmin: boolean
}

interface state {
    selectedUser?: User
    showManage?: boolean
    showGroups?: boolean
    showAdd?: boolean
    nameFilter?: string
}

export class UserList extends React.Component<props, state> {

    constructor(props: props) {
        super(props);
        this.state = {
            selectedUser: null,
            showManage: false,
            showGroups: false,
            showAdd: false,
            nameFilter: ''
        }
    }

    shouldComponentUpdate(nextProps: props, nextState: state) {
        return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState);
    }

    componentWillReceiveProps(nextProps: props) {
        if (nextProps != this.props && this.state.selectedUser) {
            this.setState({
                selectedUser: nextProps.users.get(this.state.selectedUser.uuid, null)
            });
        }
    }

    onShowAdd(u: User) {
        this.setState({
            showAdd: true
        })
    }
    onDismissAdd() {
        this.setState({
            showAdd: false
        })
    }

    onShowManage(u: User) {
        this.setState({
            selectedUser: u,
            showManage: true
        })
    }
    onDismissManage() {
        this.setState({
            showManage: false
        })
    }

    onShowGroups(u: User) {
        this.setState({
            selectedUser: u,
            showGroups: true
        })
    }
    onDismissGroups() {
        this.setState({
            showGroups: false
        })
    }

    onFilterName(e: { target: { value: string } }) {
        this.setState({
            nameFilter: e.target.value
        })
    }

    render() {
        let users = this.props.users.toArray()
            .filter((u: User) => {
                return u.name.toLowerCase().indexOf(this.state.nameFilter.toLowerCase()) !== -1;
            }, [])
            .sort((a: User, b: User) => { return a.name.localeCompare(b.name) })
            .map((u: User) => {
                return <UserView
                    key={u.uuid}
                    isAdmin={this.props.isAdmin}
                    user={u}
                    manage={this.onShowManage.bind(this, u)}
                    groups={this.onShowGroups.bind(this, u)} />
            })

        return (
            <Grid>
                <Row>
                    <Col md={3}>Name<input type="text" placeholder="Filter Names" onChange={this.onFilterName.bind(this)} /></Col>
                    <Col md={3}>Email</Col>
                    <Col md={2}>Type</Col>
                    <Col md={4}>
                        {this.props.isAdmin ?
                            <Button bsSize="xs" onClick={this.onShowAdd.bind(this)}>Admin Add User</Button> :
                            <span />
                        }
                    </Col>
                </Row>
                {users}
                <AddUserModal
                    show={this.state.showAdd}
                    dismiss={this.onDismissAdd.bind(this)}
                    dispatch={this.props.dispatch}
                    users={this.props.users} />
                <ManageUserModal
                    cancel={this.onDismissManage.bind(this)}
                    dispatch={this.props.dispatch}
                    show={this.state.showManage}
                    user={this.state.selectedUser} />
                <ManageGroupsModal
                    cancel={this.onDismissGroups.bind(this)}
                    groups={this.props.groups}
                    members={this.props.members}
                    roles={this.props.roles}
                    dispatch={this.props.dispatch}
                    show={this.state.showGroups}
                    user={this.state.selectedUser} />
            </Grid>
        )
    }
}