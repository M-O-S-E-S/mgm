import * as React from "react";
import { Action } from 'redux';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Alert } from 'react-bootstrap';
import { BusyButton } from '../../util/BusyButton';
import { post } from '../../util/network';
import { UpsertHostAction } from './HostsRedux';
import { Host } from '.';

interface props {
  show: boolean
  cancel: () => void,
  dispatch: (a: Action) => void,
}

const ipRegExp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

interface state {
  ip?: string
  error?: string
}

export class AddHostModal extends React.Component<props, state> {

  constructor(props: props) {
    super(props);
    this.state = {
      ip: '',
      error: ''
    }
  }

  componentWillReceiveProps(nextProps: props) {
    if (!nextProps.show) {
      this.setState({
        ip: '',
        error: ''
      })
    }
  }

  onAddHost(): Promise<void> {
    if (this.state.ip === '') {
      this.setState({
        error: 'Address may not be blank'
      });
      return;
    }
    //match the ip address against known internal ip ranges
    if (!ipRegExp.test(this.state.ip)) {
      this.setState({
        error: this.state.ip + ' does not appear to be an internal IP address'
      })
      return;
    }
    return post('/api/host/add', { host: this.state.ip }).then((res: any) => {
      let h = new Host();
      h = h.set('id', res.ID)
        .set('address', this.state.ip)
      this.props.dispatch(UpsertHostAction(h));
      this.props.cancel();
    }).catch((err: Error) => {
      this.setState({
        error: 'Error adding host: ' + err.message
      });
    })
  }

  onIP(e: { target: { value: string } }) {
    this.setState({ ip: e.target.value })
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.cancel}>
        <Modal.Header>
          <Modal.Title>Add a new host:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ControlLabel>Local IP Address: </ControlLabel>
          <FormControl type="text" placeholder="" onChange={this.onIP.bind(this)} />
          {this.state.error ? <Alert bsStyle="danger">{this.state.error}</Alert> : <div />}
        </Modal.Body>

        <Modal.Footer>
          <BusyButton onClick={this.onAddHost.bind(this)}>Submit</BusyButton>
          <Button onClick={this.props.cancel}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}