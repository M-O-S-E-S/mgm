import * as React from "react";
import { Map } from 'immutable';

import { Region } from '.';
import { Estate } from '../Estates';
import { Host } from '../Hosts';
import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Row, Col } from 'react-bootstrap';

interface props {
  region: Region,
  estates: Map<number, Estate>
  estateMap: Map<string, number>,
  hosts: Map<number, Host>,
  dismiss: () => void
}

const ipRegExp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

export class ManageModal extends React.Component<props, {}> {
  state: {
  }

  constructor(props: props) {
    super(props);
    this.state = {
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
      <Modal show={true} onHide={this.props.dismiss} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Managing Region {this.props.region.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Button>Delete {this.props.region.name}</Button>
          </Row>
          <Row>
            <Form>
              <FormGroup>
                <ControlLabel>Change Estate</ControlLabel>
                <FormControl componentClass="select" placeholder="select" defaultValue={this.props.estateMap.get(this.props.region.uuid).toString()}>
                  {this.props.estates.toArray().map((e: Estate) => {
                    return (
                      <option
                        key={e.id.toString()}
                        value={e.id.toString()}>
                        {e.name}
                      </option>
                    )
                  })}
                </FormControl>
                <Button>Set</Button>
              </FormGroup>
            </Form>
          </Row>
          <Row>
            <Form>
              <FormGroup>
                <ControlLabel>Change Host</ControlLabel>
                <FormControl componentClass="select" placeholder="select" defaultValue={this.props.region.node}>
                  {this.props.hosts.toArray().map((h: Host) => {
                    return <option
                      key={h.address}
                      value={h.address}>
                      {h.name}
                    </option>
                  })}
                </FormControl>
                <Button>Set</Button>
              </FormGroup>
            </Form>
          </Row>
          <Row>
            Change Position:
              X:  <input />
              Y:  <input />
            <Button>Set</Button>
          </Row>
          <Row>
            <p>Perhaps here we should place a selection of console commands to run on button-press, as the rest console isn't as interactive as one would hope on halcyon.</p>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.dismiss}>Close</Button>
        </Modal.Footer>
      </Modal >
    )
  }
}