import * as React from "react";
const shallowequal = require('shallowequal');

import { Job } from '.';

import { Row, Col, Button } from 'react-bootstrap';
import { BusyButton } from '../../util/BusyButton';

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
    deleteJob: (j: Job) => Promise<void>
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

    deleteJob():Promise<void>{
        return this.props.deleteJob(this.props.job);
    }

    render() {
        return (
            <Row>
                <Col md={1}>
                    <BusyButton bsSize="xsmall" onClick={this.deleteJob.bind(this)}>
                        <i className="fa fa-trash" aria-hidden="true" ></i>
                    </BusyButton>
                </Col>
                <Col md={1}>{this.props.job.id}</Col>
                <Col md={2}>{this.timestamptoDate(this.props.job.timestamp)}</Col>
                <Col md={2}>{this.props.job.type}</Col>
                <Col md={6}>{this.props.job.data}</Col>
            </Row>
        )
    }
}