import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { DeleteUser, UpsertUserAction } from './UsersRedux';
import { User } from '../Users';
import { Group, Role } from '../Groups';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Grid, Row, Alert } from 'react-bootstrap';
import { BusyButton } from '../../util/BusyButton';
import { post } from '../../util/network';

interface props {
  show: boolean
  cancel: () => void
  user: User
  dispatch: (a: Action) => void
  groups: Map<string, Group>
  members: Map<string, Map<string, string>>
  roles: Map<string, Map<string, Role>>
}

interface state {
  error?: string
  email?: string
  password?: string
}

export class ManageGroupsModal extends React.Component<props, state> {

  constructor(props: props) {
    super(props);
    this.state = {
      error: '',
      email: '',
      password: ''
    }
  }

  onPasswordChange(e: { target: { value: string } }) {
    this.setState({
      password: e.target.value
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
    let groups: string[] = [];

    if (this.props.user) {
      this.props.groups.toArray()
        .map((g: Group) => {
          let members = this.props.members.get(g.GroupID, Map<string, string>());
          let roleId = members.get(this.props.user.uuid, '');
          if (roleId !== '') {
            let r = this.props.roles.get(g.GroupID).get(roleId);
            console.log(g.Name + ': ' + r.Name);
            return g.Name + ': ' + r.Name
          } else {

          }
          return;
        })
    }

    return (
      <Modal show={this.props.show} onHide={this.props.cancel} >
        <Modal.Header>
          <Modal.Title>User Groups: {this.props.user ? this.props.user.name : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{this.props.user ? this.props.user.name : ''} is a member of these groups:</p>

          <div style={{ height: "10em", overflowY: "auto", border: "1px solid grey" }}>
            {groups}
          </div>


          {this.state.error ? <Alert bsStyle="danger">{this.state.error}</Alert> : <div />}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.cancel}>Close</Button>
        </Modal.Footer>
      </Modal >
    )
  }
}