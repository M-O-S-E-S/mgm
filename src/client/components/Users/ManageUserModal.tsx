import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { DeleteUser, UpsertUserAction } from './UsersRedux';
import { User } from '../Users';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Grid, Row, Alert } from 'react-bootstrap';
import { BusyButton } from '../../util/BusyButton';
import { post } from '../../util/network';

interface props {
  show: boolean
  cancel: () => void
  user: User
  dispatch: (a: Action) => void
}

interface state {
  error?: string
  email?: string
  password?: string
}

export class ManageUserModal extends React.Component<props, state> {

  constructor(props: props) {
    super(props);
    this.state = {
      error: '',
      email: '',
      password: ''
    }
  }

  setGodLevel(level: number): Promise<void> {
    return post('/api/user/accessLevel', { uuid: this.props.user.uuid, accessLevel: level }).then(() => {
      this.props.dispatch(UpsertUserAction(this.props.user.set('godLevel', level)));
    }).catch((err: Error) => {
      this.setState({
        error: 'Error changing ' + this.props.user.name + '\'s level: ' + err.message
      });
    })
  }

  onEmailChange(e: { target: { value: string } }) {
    this.setState({
      email: e.target.value
    })
  }
  setEmail(): Promise<void> {
    return post('/api/user/email', { id: this.props.user.uuid, email: this.state.email }).then(() => {
      this.props.dispatch(UpsertUserAction(this.props.user.set('email', this.state.email)))
    }).catch((err: Error) => {
      this.setState({
        error: 'Error changing ' + this.props.user.name + '\'s email: ' + err.message
      });
    });
  }

  onPasswordChange(e: { target: { value: string } }) {
    this.setState({
      password: e.target.value
    })
  }
  setPassword(): Promise<void> {
    if (this.state.password === '') {
      this.setState({
        error: 'Password may not be empty'
      });
      return Promise.resolve();
    }
    if (this.state.password.length > 16) {
      this.setState({
        error: 'Passwords greather than 16 characters are truncated by some clients, and are not permitted'
      });
      return Promise.resolve();
    }
    return post('/api/user/password', { id: this.props.user.uuid, password: this.state.password }).then(() => {
      this.props.dispatch(UpsertUserAction(this.props.user.set('email', this.state.email)))
      this.setState({
        error: ''
      });
    }).catch((err: Error) => {
      this.setState({
        error: 'Error changing ' + this.props.user.name + '\'s email: ' + err.message
      });
    })
  }

  deleteUser(): Promise<void> {
    return post('/api/user/destroy/' + this.props.user.uuid).then(() => {
      alertify.success('User ' + this.props.user.name + ' deleted');
      this.props.dispatch(DeleteUser(this.props.user));
    }).catch((err: Error) => {
      alertify.error('Error Deleting ' + this.props.user.name + ': ' + err.message);
    })
  }

  render() {
    let userType = '';
    if (this.props.user) {
      switch (this.props.user.godLevel) {
        case 0:
          userType = 'suspended';
          break;
        case 1:
          userType = 'temporary';
          break;
        case 2:
          userType = 'resident';
          break;
        case 50:
          userType = 'Group Owner';
          break;
        case 200:
          userType = 'Grid God';
          break;
        case 250:
          userType = 'Administrator';
          break;
      }
    }
    return (
      <Modal show={this.props.show} onHide={this.props.cancel} >
        <Modal.Header>
          <Modal.Title>
            Manage User: {this.props.user ? this.props.user.name : ''}
            {this.props.user && this.props.user.godLevel < 2 ? <BusyButton bsSize="xsmall" bsStyle="danger" onClick={this.deleteUser.bind(this)}>Delete</BusyButton> : <span />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Email: {this.props.user ? this.props.user.email : ''}</h3>
          <h3>Status: {userType}</h3>
          <p>Change the user's access level by pressing the appropriate button below.  The user may need to log out and back into the Grid to receive their updated permissions</p>
          <Grid>
            <Row><BusyButton onClick={this.setGodLevel.bind(this, 0)}>Suspend User</BusyButton> Changes user GodLevel to 0</Row>
            <Row><BusyButton onClick={this.setGodLevel.bind(this, 1)}>Make Temporary</BusyButton> Changes user GodLevel to 1</Row>
            <Row><BusyButton onClick={this.setGodLevel.bind(this, 2)}>Make Resident</BusyButton> Changes user GodLevel to 2</Row>
            <Row><BusyButton onClick={this.setGodLevel.bind(this, 50)}>Make Group Admin</BusyButton> Changes user GodLevel to 50</Row>
            <Row><BusyButton onClick={this.setGodLevel.bind(this, 200)}>Make Grid God</BusyButton> Changes user GodLevel to 200</Row>
            <Row><BusyButton onClick={this.setGodLevel.bind(this, 250)}>Make Admin</BusyButton> Changes user GodLevel to 250</Row>
          </Grid>

          <Row>
            <ControlLabel>Change Email: </ControlLabel>
            <FormControl type="text" placeholder={this.props.user ? this.props.user.email : ''} onChange={this.onEmailChange.bind(this)} />
            <BusyButton onClick={this.setEmail.bind(this)}>Update Email</BusyButton>
          </Row>

          <Row>
            <ControlLabel>Change Password: </ControlLabel>
            <FormControl type="text" placeholder="" onChange={this.onPasswordChange.bind(this)} />
            <BusyButton onClick={this.setPassword.bind(this)}>Update Password</BusyButton>
          </Row>
          {this.state.error ? <Alert bsStyle="danger">{this.state.error}</Alert> : <div />}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.cancel}>Close</Button>
        </Modal.Footer>
      </Modal >
    )
  }
}