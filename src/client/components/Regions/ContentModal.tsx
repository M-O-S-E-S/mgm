import * as React from "react";

import { Region } from '.';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

interface props {
  show: boolean,
  region: Region,
  dismiss: () => void
}

const ipRegExp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

export class ContentModal extends React.Component<props, {}> {
  state: {
    ip: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
       ip: ''
    }
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.dismiss} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Managing Region {this.props.region ? this.props.region.name : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Content Management</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.dismiss}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}