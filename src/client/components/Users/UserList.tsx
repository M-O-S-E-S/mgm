import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { UserView } from './UserView';
import { User } from '.';

import { Grid, Row, Col } from 'react-bootstrap'

interface UserListProps {
    dispatch: (a: Action) => void,
    users: Map<string,User>
}

export class UserList extends React.Component<UserListProps, {}> {

    shouldComponentUpdate(nextProps: UserListProps) {
        return !shallowequal(this.props, nextProps);
    }

    render() {
        let users = this.props.users.toList().map((u: User) => {
            return <UserView key={u.uuid} user={u}/>
        })

        return (
            <Grid>
                <Row>
                    <Col md={3}>Name</Col>
                    <Col md={3}>Email</Col>
                </Row>
                {users}
            </Grid>
        )
    }
}