import * as React from "react";
import { Map } from 'immutable';

import { Estate } from '.'
import { User } from '../Users';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

interface props {
  submit: (name: string, owner: string) => void,
  cancel: () => void
  users: Map<string, User>
  estates: Map<number, Estate>
}

const ipRegExp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

export class EstateAddModal extends React.Component<props, {}> {
  state: {
    name: string
    owner: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
      name: '',
      owner: ''
    }
  }

  handleSubmit() {
    if (this.state.name === '') {
      return alertify.error('Name may not be blank');
    }
    //make sure the name does not collide with another estate
    let duplicates = this.props.estates.filter((e: Estate) => {
      return e.name === this.state.name;
    });
    if (duplicates.size > 0) {
      return alertify.error('An estate already exists by that name');
    }
    if (this.state.owner === '') {
      return alertify.error('The new estate requires an owner');
    }
    this.props.submit(this.state.name, this.state.owner);
  }

  onName(e: { target: { value: string } }) {
    this.setState({ name: e.target.value })
  }
  onOwner(e: { target: { value: string } }) {
    this.setState({ owner: e.target.value })
  }

  render() {
    let users = this.props.users.toList().sort((a, b) => {
      return a.name.localeCompare(b.name);
    }).map((u: User) => {
      return <option key={u.uuid} value={u.uuid}>{u.name}</option>
    });
    return (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>Add a new Estate:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ControlLabel>Name: </ControlLabel>
          <FormControl type="text" placeholder="Estate Name" onChange={this.onName.bind(this)} />
          <ControlLabel>Owner: </ControlLabel>
          <FormControl componentClass="select" placeholder="" onChange={this.onOwner.bind(this)}>
            <option value=''>please select an owner</option>
            {users}
          </FormControl>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.handleSubmit.bind(this)}>Submit</Button>
          <Button onClick={this.props.cancel}>Cancel</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }
}