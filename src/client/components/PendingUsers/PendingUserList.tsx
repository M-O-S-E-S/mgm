import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';

import { PendingUser } from '.';
import { PendingUserView } from './PendingUserView';

import { Grid, Row, Col } from 'react-bootstrap';

interface props {
    dispatch: (a: Action) => void,
    users: Map<string,PendingUser>
}

export class PendingUserList extends React.Component<props, {}> {
    render() {
        let users = this.props.users.toList().map((u: PendingUser) => {
            return <PendingUserView key={u.name} user={u}/>
        })

        return (
            <Grid>
                <Row>
                    <Col md={3}>Name</Col>
                    <Col md={3}>Email</Col>
                    <Col md={3}>Registered</Col>
                    <Col md={3}>Summary</Col>
                </Row>
                {users}
            </Grid>
        )
    }
}