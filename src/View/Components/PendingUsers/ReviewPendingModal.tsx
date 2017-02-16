import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { User } from '../../Immutable'
import { PendingUser } from '../../Immutable';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Row, Button, Alert } from 'react-bootstrap';
import { BusyButton } from '../BusyButton';
import { ClientStack } from '../..';
import { ReduxStore } from '../../Redux';

interface props {
  show: boolean
  cancel: () => void
  user: PendingUser
  store: ReduxStore
}

interface state {
  reason?: string,
  error?: string
}

export class ReviewPendingModal extends React.Component<props, state> {

  constructor(props: props) {
    super(props);
    this.state = {
      reason: '',
      error: ''
    }
  }

  componentWillReceiveProps(nextProps: props) {
    if (!nextProps.show) {
      this.setState({
        reason: '',
        error: ''
      })
    }
  }

  onReason(e: { target: { value: string } }) {
    this.setState({ reason: e.target.value })
  }

  onApprove(): Promise<void> {
    return ClientStack.PendingUser.Approve(this.props.user).then((uuid) => {
      // place user into redux
      let u = new User();
      u = u.set('name', this.props.user.name)
        .set('email', this.props.user.email)
        .set('uuid', uuid)
        .set('godLevel', 1);
      this.props.store.User.Update(u);
      // remove pending user from redux
      this.props.store.PendingUser.Destroy(this.props.user);
      this.props.cancel();
    }).catch((err: Error) => {
      this.setState({
        error: 'Error approving user: ' + err.message
      });
    })
  }
  onReject(): Promise<void> {
    return ClientStack.PendingUser.Deny(this.props.user, this.state.reason).then(() => {
      // remove pending user from redux
      this.props.store.PendingUser.Destroy(this.props.user);
      this.props.cancel();
    }).catch((err: Error) => {
      this.setState({
        error: 'Error approving user: ' + err.message
      });
    })
  }

  render() {
    console.log('render');
    return (
      <Modal show={this.props.show} onHide={this.props.cancel}>
        <Modal.Header>
          <Modal.Title>Review Pending User: {this.props.user ? this.props.user.name : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Email: {this.props.user ? this.props.user.email : ''}</h3>
          <h3>Summary:</h3>
          <p>{this.props.user ? this.props.user.summary : ''}</p>
          <BusyButton bsStyle="success" onClick={this.onApprove.bind(this)}>Approve</BusyButton><br />
          <ControlLabel>Denial Message: </ControlLabel>
          <textarea className="form-control" placeholder="Your account has been denied because ..." onChange={this.onReason.bind(this)} />
          <BusyButton bsStyle="danger" onClick={this.onReject.bind(this)}>Deny</BusyButton>
          {this.state.error ? <Alert bsStyle="danger">{this.state.error}</Alert> : <div />}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.cancel}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}