import * as React from "react";

import { Region } from '.';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Alert } from 'react-bootstrap';
import { BusyButton } from '../../util/BusyButton';
import { post } from '../../util/network';

interface props {
    show: boolean,
    region: Region,
    dismiss: () => void
}

interface state {
    loadOarError?: string
    loadOarSuccess?: string
    saveOarError?: string
    saveOarSuccess?: string
    nukeError?: string
    nukeSuccess?: string
}

export class ContentModal extends React.Component<props, state> {

    // a property to hang file uploads from
    oarFile: any = null;

    constructor(props: props) {
        super(props);
        this.state = {
            loadOarError: '',
            loadOarSuccess: '',
            saveOarError: '',
            saveOarSuccess: '',
            nukeError: '',
            nukeSuccess: '',
        };
    }

    onUploadOar(): Promise<void> {
        let file = this.oarFile.files[0];
        if (file == undefined) {
            // no selection was made
            this.setState({
                loadOarSuccess: '',
                loadOarError: 'No file selected'
            });
            return;
        }
        if (!this.props.region.isRunning) {
            this.setState({
                loadOarSuccess: '',
                loadOarError: 'The region must be running for OAR operations'
            });
            return;
        }

        // Create an oar upload job for this user and region
        return post('/api/task/loadOar/' + this.props.region.uuid)
            .then((res: any) => {
                let jobID = res.ID;
                // todo: insert job into redux to make it appear before the next data refresh

                // initiate the upload
                return post('/api/task/upload/' + jobID, {file: file});
            }).then(() => {
                this.setState({
                    loadOarSuccess: 'File uploaded.  Further updates are on the jobs list on your account page.',
                    loadOarError: ''
                });
            }).catch((err: Error) => {
                this.setState({
                    loadOarSuccess: '',
                    loadOarError: 'Error queuing OAR load: ' + err.message
                });
            });
    }

    onSaveOar(): Promise<void> {
        if (!this.props.region.isRunning) {
            this.setState({
                saveOarSuccess: '',
                saveOarError: 'The region must be running for OAR operations'
            });
            return;
        }

        return post('/api/task/saveOar/' + this.props.region.uuid).then(() => {
            this.setState({
                saveOarSuccess: 'OAR save scheduled',
                saveOarError: ''
            })
        }).catch((err: Error) => {
            this.setState({
                saveOarSuccess: '',
                saveOarError: 'Error saving OAR file: ' + err.message
            })
        })
    }

    onNuke(): Promise<void> {
        if (!this.props.region.isRunning) {
            this.setState({
                saveOarSuccess: '',
                saveOarError: 'The region must be running for OAR operations'
            });
            return;
        }

        return post('/api/task/nukeContent/' + this.props.region.uuid).then(() => {
            this.setState({
                nukeSuccess: 'Region wipe scheduled',
                nukeError: ''
            })
        }).catch((err: Error) => {
            this.setState({
                nukeSuccess: '',
                nukeError: 'Error wiping region: ' + err.message
            })
        })
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.dismiss} bsSize="large">
                <Modal.Header closeButton>
                    <Modal.Title>Managing Region {this.props.region ? this.props.region.name : ''}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h3>Load an OAR file</h3>
                    <p>Load an oar file into this region.</p>
                    <input type="file" name="oarFile" ref={(ref) => this.oarFile = ref} />
                    <BusyButton onClick={this.onUploadOar.bind(this)}>Upload</BusyButton>
                    {this.state.loadOarError ? <Alert bsStyle="danger">{this.state.loadOarError}</Alert> : <div />}
                    {this.state.loadOarSuccess ? <Alert bsStyle="success">{this.state.loadOarSuccess}</Alert> : <div />}

                    <h3>Download an OAR file</h3>
                    <p>Queue a save oar function.  MGM will save the oarfile for you, and offer it for download on your account page.  This can take several minutes to complete.</p>
                    <BusyButton onClick={this.onSaveOar.bind(this)}>Save OAR for later download</BusyButton>
                    {this.state.saveOarError ? <Alert bsStyle="danger">{this.state.saveOarError}</Alert> : <div />}
                    {this.state.saveOarSuccess ? <Alert bsStyle="success">{this.state.saveOarSuccess}</Alert> : <div />}

                    <h3>Reset region to default</h3>
                    <p>Completely erase all terrain and content from this region, returning it to its original state.  If there is any content you wish to keep, please download an oar file first.</p>
                    <BusyButton onClick={this.onNuke.bind(this)}>Nuke</BusyButton>
                    {this.state.nukeError ? <Alert bsStyle="danger">{this.state.nukeError}</Alert> : <div />}
                    {this.state.nukeSuccess ? <Alert bsStyle="success">{this.state.nukeSuccess}</Alert> : <div />}

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.dismiss}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}