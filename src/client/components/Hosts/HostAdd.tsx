import * as React from "react";

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

interface props {
  submit: (address: string) => void,
  cancel: () => void
}

const ipRegExp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

export class HostAddModal extends React.Component<props, {}> {
  state: {
    ip: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
       ip: ''
    }
  }

  handleSubmit() {
    if(this.state.ip === ''){
      return alertify.error('Address may not be blank');
    }
    //match the ip address against known internal ip ranges
    if(ipRegExp.test(this.state.ip)){
      this.props.submit(this.state.ip);
    } else {
      alertify.error(this.state.ip + ' does not appear to be an internal IP address')
    }
  }

  onIP(e: { target: { value: string } }) {
    this.setState({ ip: e.target.value })
  }

  render() {
    return (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>Add a new host:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ControlLabel>Local IP Address: </ControlLabel>
          <FormControl type="text" placeholder="" onChange={this.onIP.bind(this) }/>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.handleSubmit.bind(this) }>Submit</Button>
          <Button onClick={this.props.cancel}>Cancel</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }
}