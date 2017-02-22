import * as React from "react";

import { Region } from '../../Immutable';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

import { ClientStack } from '../..';

interface props {
  show: boolean,
  region: Region,
  dismiss: () => void
}

interface state {
  loaded: boolean
  content: string
}

export class LogModal extends React.Component<props, {}> {
  state: state

  constructor(props: props) {
    super(props);
    this.state = {
      loaded: false,
      content: ''
    }
  }

  componentWillReceiveProps(nextProps: props) {
    if (!nextProps.region) return;
    if (!nextProps.show) {
      this.setState({
        content: ''
      });
      return;
    }

    ClientStack.Region.GetLog(nextProps.region).then((logString: string) => {
      this.setState({
        loaded: true,
        content: logString//.split('\n').map((s: string, idx: number) => {
        //return <p key={'logline ' + idx}>{s}</p>
        //})
      });
    }).catch((err: Error) => {
      this.setState({
        loaded: true,
        content: <p>{'Could not get logs for ' + nextProps.region.name + ': ' + err.message}</p>
      });
    })
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.dismiss} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>{this.props.region ? this.props.region.name + ' ' : ''}Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ whiteSpace: 'pre-line' }}>
          {this.state.loaded ? this.state.content : <p>Loading...</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.dismiss}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}