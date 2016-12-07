import * as React from "react";

import { User } from '.';

import { Row, Col } from 'react-bootstrap'

export class UserView extends React.Component<{ user: User }, {}> {
    render() {
        return (
            <Row>
                <Col md={3}>{this.props.user.name}</Col>
                <Col md={3}>{this.props.user.email}</Col>
            </Row>
        )
    }
}