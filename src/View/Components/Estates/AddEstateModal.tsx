import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { Estate, User } from '../../Immutable'

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Alert } from 'react-bootstrap';
import { BusyButton } from '../BusyButton';
import { ClientStack } from '../..';
import { ReduxStore } from '../../Redux';

interface props {
  show: boolean
  cancel: () => void
  users: Map<string, User>
  estates: Map<number, Estate>
  store: ReduxStore
}

interface state {
  name?: string,
  owner?: string,
  error?: string
}

export class AddEstateModal extends React.Component<props, state> {

  constructor(props: props) {
    super(props);
    this.state = {
      name: '',
      owner: '',
      error: ''
    }
  }

  componentWillReceiveProps(nextProps: props) {
    if (!nextProps.show) {
      this.setState({
        name: '',
        owner: '',
        error: ''
      })
    }
  }

  onNewEstate(): Promise<void> {
    if (this.state.name === '') {
      this.setState({
        error: 'Estate name may not be blank'
      });
      return;
    }
    //make sure the name does not collide with another estate
    let duplicates = this.props.estates.filter((e: Estate) => {
      return e.EstateName === this.state.name;
    });
    if (duplicates.size > 0) {
      this.setState({
        error: 'Estate name is already taken'
      });
      return;
    }
    if (this.state.owner === '') {
      this.setState({
        error: 'The new estate requires an owner'
      })
      return;
    }

    return ClientStack.Estate.Create(this.state.name, this.props.users.get(this.state.owner)).then((id: number) => {
      // update redux
      let e = new Estate();
      e = e.set('EstateID', id)
        .set('EstateName', this.state.name)
        .set('EstateOwner', this.state.owner);
      this.props.store.Estate.Update(e);

      this.props.cancel();
    }).catch((err: Error) => {
      this.setState({
        error: 'Error creating estate: ' + err.message
      })
    })
  }

  onName(e: { target: { value: string } }) {
    this.setState({ name: e.target.value })
  }
  onOwner(e: { target: { value: string } }) {
    this.setState({ owner: e.target.value })
  }

  render() {
    let users = this.props.users.toList().sort((a, b) => {
      return a.lastname.localeCompare(b.lastname);
    }).map((u: User) => {
      return <option key={u.UUID} value={u.UUID}>{u.name()}</option>
    });
    return (
      <Modal show={this.props.show} onHide={this.props.cancel}>
        <Modal.Header>
          <Modal.Title>Add a new Estate:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ControlLabel>Name: </ControlLabel>
          <FormControl type="text" placeholder="Estate Name" onChange={this.onName.bind(this)} />
          <ControlLabel>Owner: </ControlLabel>
          <FormControl componentClass="select" defaultValue={''} onChange={this.onOwner.bind(this)}>
            <option value=''>please select an owner</option>
            {users}
          </FormControl>
          {this.state.error ? <Alert bsStyle="danger">{this.state.error}</Alert> : <div />}
        </Modal.Body>

        <Modal.Footer>
          <BusyButton onClick={this.onNewEstate.bind(this)}>Submit</BusyButton>
          <Button onClick={this.props.cancel}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}