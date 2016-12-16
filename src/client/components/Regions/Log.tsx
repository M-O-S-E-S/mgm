import * as React from "react";

import { Region } from '.';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

import { get, post } from '../../util/network';

interface props {
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

    get('/api/region/logs/' + this.props.region.uuid).then((result: any) => {
      let logString: string = result.Message;
      this.setState({
        loaded: true,
        content: logString.split('\n').map((s: string, idx: number) => {
          return <p key={'logline ' + idx}>{s}</p>
        })
      });
    }).catch((err: Error) => {
      this.setState({
        loaded: true,
        content: <p>{'Could not get logs for ' + this.props.region.name + ': ' + err.message}</p>
      });
    })
  }

  render() {
    return (
      <Modal show={true} onHide={this.props.dismiss} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>{this.props.region.name + ' '}Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { this.state.loaded? this.state.content : <p>Loading...</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.dismiss}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}