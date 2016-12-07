import * as React from "react";

import { Region } from '.';

import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

interface props {
  region: Region,
  dismiss: () => void
}

const ipRegExp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

export class ManageModal extends React.Component<props, {}> {
  state: {
    ip: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
       ip: ''
    }
  }

  /*handleSubmit() {
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
  }*/

  //region management holds the following sections
  // if running:  Content and Console
  //        console <-- not very important anymore, may include command issue without feedback
  //        Content <-- very important, load/save oar, nuke
  // if not running: Estate, Position, Host, Delete region

  // always view log ?
  // also, start, stop, kill

  render() {
    return (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>Managing Region {this.props.region.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Content Management</p>
          <p>estate</p>
          <p>coordinates</p>
          <p>host</p>
          <p>console command?</p>
          <p>delete me</p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.dismiss}>Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }
}