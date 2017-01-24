import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { UserView } from './UserView';
import { User } from '.';
import { ManageUserModal } from './ManageUserModal';

import { Grid, Row, Col } from 'react-bootstrap'

interface props {
    dispatch: (a: Action) => void,
    users: Map<string, User>
}

interface state {
    selectedUser?: User
    showManage?: boolean
    showGroups?: boolean
}

export class UserList extends React.Component<props, state> {

    constructor(props: props) {
        super(props);
        this.state = {
            selectedUser: null,
            showManage: false,
            showGroups: false
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

    render() {
        let users = this.props.users.toArray()
            .sort((a: User, b: User) => { return a.name.localeCompare(b.name) })
            .map((u: User) => {
                return <UserView
                    key={u.uuid}
                    user={u}
                    manage={this.onShowManage.bind(this, u)}
                    dispatch={this.props.dispatch} />
            })

        return (
            <Grid>
                <Row>
                    <Col md={3}>Name</Col>
                    <Col md={3}>Email</Col>
                    <Col md={1}>Type</Col>
                </Row>
                {users}
                <ManageUserModal
                    cancel={this.onDismissManage.bind(this)}
                    dispatch={this.props.dispatch}
                    show={this.state.showManage}
                    user={this.state.selectedUser} />
            </Grid>
        )
    }
}