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

import { downloadFile } from '../../ClientStack/call';

export class JobView extends React.Component<props, {}> {

    shouldComponentUpdate(nextProps: props) {
        return !shallowequal(this.props, nextProps);
    }

    timestamptoDate(timestamp: Date): string {
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

    downloadFile(): Promise<void> {
        return downloadFile('/api/job/download/' + this.props.job.id).then((blob) => {
            let data = JSON.parse(this.props.job.data);
            let uri = URL.createObjectURL(blob);
            var link = document.createElement('a');
            if (typeof link.download === 'string') {
                document.body.appendChild(link); //Firefox requires the link to be in the body
                link.download = data.FileName + '.oar';
                link.href = uri;
                link.click();
                document.body.removeChild(link); //remove the link when done
            } else {
                location.replace(uri);
            }
        }).catch((err: Error) => {
            alertify.error(err.message);
        })
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
                    status = <BusyButton bsSize="xsmall" onClick={this.downloadFile.bind(this)}>Download {data.FileName}.oar</BusyButton>;
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