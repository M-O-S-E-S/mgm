import * as React from "react";
const shallowequal = require('shallowequal');

import { Job } from '.';

import { Row, Col } from 'react-bootstrap'

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

interface props {
    job: Job
}

export class JobView extends React.Component<props, {}> {

    shouldComponentUpdate(nextProps: props) {
        return !shallowequal(this.props.job, nextProps.job);
    }

    timestamptoDate(timestamp: string): string {
        let date = new Date(timestamp);
        return monthNames[date.getMonth()] + ' ' + date.getDate() + ' ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2);
    }

    render() {
        return (
            <Row>
                <Col md={1}>{this.props.job.id}</Col>
                <Col md={2}>{this.timestamptoDate(this.props.job.timestamp)}</Col>
                <Col md={2}>{this.props.job.type}</Col>
                <Col md={7}>{this.props.job.data}</Col>
            </Row>
        )
    }
}