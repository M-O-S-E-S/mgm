import * as React from "react";
import { Action } from "redux";
import { Map, Set } from 'immutable';
const shallowequal = require('shallowequal');

import { Group, Role } from '.';
import { GroupView } from './GroupView';
import { User } from '../Users';

import { Grid, Row, Col } from 'react-bootstrap';

interface props {
    dispatch: (a: Action) => void
    groups: Map<string, Group>
    members: Map<string, Map<string, string>>
    roles: Map<string, Map<string, Role>>
    users: Map<string,User>
}

export class GroupList extends React.Component<props, {}> {

    shouldComponentUpdate(nextProps: props) {
        return !shallowequal(this.props, nextProps);
    }

    render() {
        let groups = this.props.groups.toList().map((g: Group) => {
            return <GroupView
            key={g.GroupID}
            members={this.props.members.get(g.GroupID)}
            roles={this.props.roles.get(g.GroupID)}
            group={g}
            users={this.props.users} />
        })
        return (
            <Grid>
                <h1>Groups</h1>
                <Row>
                    <Col md={3}>Name</Col>
                    <Col md={3}>Founder</Col>
                    <Col md={1}>Membership</Col>
                    <Col md={5}>Roles</Col>
                </Row>
                {groups}
            </Grid>
        );
    }
}
