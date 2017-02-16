import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { User } from '.';
import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Grid, Row, Col, Alert, Radio } from 'react-bootstrap';
import { BusyButton } from '../BusyButton';
import { ClientStack } from '../..';
import { ReduxStore } from '../../Redux';

import { UpsertUserAction } from '.';

interface props {
  show: boolean
  users: Map<string, User>
  dismiss: () => void,
  store: ReduxStore
}

interface state {
  name?: string
  email?: string
  password?: string
  template?: string
  error?: string
  success?: string
}

export class AddUserModal extends React.Component<props, state> {

  constructor(props: props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      template: '',
      error: '',
      success: ''
    }
  }

  componentWillReceiveProps(nextProps: props) {
    if (!nextProps.show) {
      this.setState({
        name: '',
        email: '',
        password: '',
        template: '',
        error: '',
        success: ''
      })
    }
  }

  onNameChange(e: { target: { value: string } }) {
    this.setState({
      name: e.target.value
    })
  }

  onEmailChange(e: { target: { value: string } }) {
    this.setState({
      email: e.target.value
    })
  }

  onPasswordChange(e: { target: { value: string } }) {
    this.setState({
      password: e.target.value
    })
  }

  onTemplateChange(e: { target: { value: string } }) {
    this.setState({
      template: e.target.value
    })
  }

  onAddUser(): Promise<void> {
    // Validate avatar name
    if (this.state.name.trim() === '' || this.state.name.trim().split(' ').length !== 2) {
      this.setState({
        error: 'Avatar name must be first and last name, and is required',
        success: ''
      })
      return Promise.resolve();
    }
    let users = this.props.users.toArray().filter((u: User) => {
      return this.state.name.trim() === u.name();
    });
    if (users.length !== 0) {
      this.setState({
        error: 'Avatar names must be unique',
        success: ''
      })
      return Promise.resolve();
    }

    // validate password
    if (this.state.password === '' || this.state.password.length > 16) {
      this.setState({
        error: 'A password less than 16 characters long is required',
        success: ''
      })
      return Promise.resolve();
    }

    // this is admin action, we dont need to validate emails.  They do not need to be unique

    //validate template
    if (this.state.template === '') {
      this.setState({
        error: 'you must select a template',
        success: ''
      })
      return Promise.resolve();
    }

    this.setState({
      error: '',
      success: ''
    })

    return ClientStack.User.Create(
      this.state.name,
      this.state.email,
      this.state.template,
      this.state.password
    ).then((uuid: string) => {
      let u = new User();
      u = u.set('uuid', uuid)
        .set('name', this.state.name)
        .set('email', this.state.email);
      this.props.store.User.Update(u);
      this.setState({
        error: '',
        success: 'User ' + this.state.name + ' created successfully'
      })
    }).catch((err: Error) => {
      this.setState({
        error: 'Error creating user: ' + err.message,
        success: ''
      })
    })
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.dismiss} bsSize="large">
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>Add a new User</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <FormGroup>
              <ControlLabel>Avatar Name:</ControlLabel>
              <FormControl onChange={this.onNameChange.bind(this)} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Email:</ControlLabel>
              <FormControl onChange={this.onEmailChange.bind(this)} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Password:</ControlLabel>
              <FormControl onChange={this.onPasswordChange.bind(this)} />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Avatar Template: </ControlLabel>
              <Radio name="gender" value="M" onChange={this.onTemplateChange.bind(this)} inline>Male</Radio>
              <Radio name="gender" value="F" onChange={this.onTemplateChange.bind(this)} inline>Female</Radio>
            </FormGroup>

            <BusyButton onClick={this.onAddUser.bind(this)}>Create</BusyButton>
            {this.state.error ? <Alert bsStyle="danger">{this.state.error}</Alert> : <div />}
            {this.state.success ? <Alert bsStyle="success">{this.state.success}</Alert> : <div />}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.dismiss}>Close</Button>
          </Modal.Footer>
        </Form>
      </Modal >
    )
  }
}