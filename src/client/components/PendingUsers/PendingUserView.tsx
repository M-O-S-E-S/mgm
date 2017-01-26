import * as React from "react";
import { Store } from 'redux'
import { PendingUser } from '.';
const shallowequal = require('shallowequal');

import { Grid, Row, Col, Button } from 'react-bootstrap';

interface PUProps {
    user: PendingUser
    onReview: ()=>void
}

const monthNames: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
]

export class PendingUserView extends React.Component<PUProps, {}> {

    shouldComponentUpdate(nextProps: PUProps) {
        return !shallowequal(this.props, nextProps);
    }

    formatDate(timestamp: string): string {
        let date = new Date(timestamp);
        return monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ': ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2);
    }

    render() {
        return (
            <Row>
                <Col md={3}>{this.props.user.name}</Col>
                <Col md={3}>{this.props.user.email}</Col>
                <Col md={3}>{this.formatDate(this.props.user.registered)}</Col>
                <Col md={3}><Button bsSize="small" onClick={this.props.onReview}>Review</Button></Col>
            </Row>
        )
    }
}