import * as React from "react";

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

interface props {
  submit: (password: string) => void,
  cancel: () => void
}

export class SetPasswordModal extends React.Component<props, {}> {
  state: {
    p1: string
    p2: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
      p1: '',
      p2: ''
    }
  }

  handleSubmit() {
    if(this.state.p1 === ''){
      return alertify.error('Password may not be blank');
    }
    if (this.state.p1 !== this.state.p2) {
      return alertify.error('Passwords do not match');
    }
    this.props.submit(this.state.p1);
  }

  onP1(e: { target: { value: string } }) {
    this.setState({ p1: e.target.value })
  }

  onP2(e: { target: { value: string } }) {
    this.setState({ p2: e.target.value })
  }


  render() {
    return (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>Set Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ControlLabel>Password: </ControlLabel>
          <FormControl type="password" placeholder="" onChange={this.onP1.bind(this) }/>
          <ControlLabel>Repeat: </ControlLabel>
          <FormControl type="password" placeholder="" onChange={this.onP2.bind(this) }/>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.handleSubmit.bind(this) }>Submit</Button>
          <Button onClick={this.props.cancel}>Cancel</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }
}