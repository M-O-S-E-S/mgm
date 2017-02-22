import * as React from "react";
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { Job, Region } from '../../Immutable';

import { Row, Col, Button } from 'react-bootstrap';
import { BusyButton } from '../BusyButton';

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
    deleteJob: (j: Job) => Promise<void>,
    regions: Map<string, Region>
}

export class JobView extends React.Component<props, {}> {

    shouldComponentUpdate(nextProps: props) {
        return !shallowequal(this.props, nextProps);
    }

    timestamptoDate(timestamp: Date): string {
        console.log(typeof (timestamp));
        let date = timestamp;//new Date(timestamp);
        return monthNames[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear() + ' ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2);
    }

    deleteJob(): Promise<void> {
        return this.props.deleteJob(this.props.job).catch((err: Error) => {
            alertify.error('Error deleting job: ' + err.message);
        });
    }

    render() {
        let status = <span />;
        let description = this.props.job.type;
        switch (this.props.job.type) {
            case "nuke":
                let data = JSON.parse(this.props.job.data);
                status = data.Status;
                description = 'nuke ' + this.props.regions.get(data.Region, new Region()).name
                break;
            case "save_oar":
                data = JSON.parse(this.props.job.data);
                description = 'save oar ' + this.props.regions.get(data.Region, new Region()).name
                if (data.Status === "Done") {
                    status = <a href={'/api/task/ready/' + this.props.job.id}>Download {data.FileName}.oar</a>;
                } else {
                    status = <span>{data.Status}</span>;
                }
                break;
            case "load_oar":
                data = JSON.parse(this.props.job.data);
                description = 'load oar ' + this.props.regions.get(data.Region, new Region()).name
                status = <span>{data.Status}</span>;
                break;
            default:
                try {
                    data = JSON.parse(this.props.job.data);
                    status = data.Status;
                } catch (err) {
                    status = <span>{this.props.job.data}</span>;
                }
        }
        return (
            <Row>
                <Col md={1}>
                    <BusyButton bsSize="xsmall" onClick={this.deleteJob.bind(this)}>
                        <i className="fa fa-trash" aria-hidden="true" ></i>
                    </BusyButton>
                </Col>
                <Col md={1}>{this.props.job.id}</Col>
                <Col md={2}>{this.timestamptoDate(this.props.job.timestamp)}</Col>
                <Col md={3}>{description}</Col>
                <Col md={5}>{status}</Col>
            </Row>
        )
    }
}