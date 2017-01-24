import * as React from "react";
const shallowequal = require('shallowequal');

import { User } from '.';

import { Row, Col, Button } from 'react-bootstrap'

interface props {
    user: User,
    manage: () => void
}

interface state {
    showManage?: boolean
    showGroups?: boolean
}

export class UserView extends React.Component<props, state> {

    constructor(props: props){
        super(props);
        this.state = {
            showManage: false,
            showGroups: false
        }
    }

    shouldComponentUpdate(nextProps: props) {
        return !shallowequal(this.props, nextProps);
    }

    render() {
        let userType = '';
        switch (this.props.user.godLevel) {
            case 0:
                userType = 'suspended';
                break;
            case 1:
                userType = 'temporary';
                break;
            case 2:
                userType = 'resident';
                break;
            case 50:
                userType = 'Group Owner';
                break;
            case 200:
                userType = 'Grid God';
                break;
            case 250:
                userType = 'Administrator';
                break;
        }
        return (
            <Row>
                <Col md={3}>{this.props.user.name}</Col>
                <Col md={3}>{this.props.user.email}</Col>
                <Col md={2}>{userType}</Col>
                <Col md={4}>
                    <Button bsSize="small" onClick={this.props.manage}>Manage</Button>
                    <Button bsSize="small">Groups</Button>
                </Col>
            </Row>
        )
    }
}