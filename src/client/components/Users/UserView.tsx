import * as React from "react";
const shallowequal = require('shallowequal');

import { User } from '.';

import { Row, Col } from 'react-bootstrap'

interface props {
    user: User
}

export class UserView extends React.Component<props, {}> {

    shouldComponentUpdate(nextProps: props) {
        return !shallowequal(this.props, nextProps);
    }

    render() {
        return (
            <Row>
                <Col md={3}>{this.props.user.name}</Col>
                <Col md={3}>{this.props.user.email}</Col>
            </Row>
        )
    }
}