import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { DeleteRegionAction } from '.';
import { Region } from '.';
import { Estate } from '../Estates';
import { Host } from '../Hosts';
import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Row, Col, Alert } from 'react-bootstrap';
import { post } from '../../util/network';


interface props {
  show: boolean
  region: Region,
  estates: Map<number, Estate>
  estateMap: Map<string, number>,
  hosts: Map<number, Host>,
  dismiss: () => void,
  dispatch: (a: Action) => void
}

const ipRegExp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

export class ManageModal extends React.Component<props, {}> {
  state: {
    deleteError: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
      deleteError: ''
    }
  }

  onDelete() {
    if (this.props.region.isRunning) {
      this.setState({
        deleteError: 'Cannot delete a running region'
      });
      return;
    }
    if (this.props.region.node !== '') {
      this.setState({
        deleteError: 'Cannot delete a region that is still assigned a host'
      })
      return;
    }
    post('/api/region/destroy/'+this.props.region.uuid).then(() => {
      this.props.dispatch(DeleteRegionAction(this.props.region));
      this.props.dismiss();
    }).catch((err: Error) => {
      this.setState({
        deleteError: 'Cannot delete region: ' + err.message
      })
    })
  }

  render() {
    // region may be null, assign fields
    let regionName = '';
    let regionId = '';
    let selectDefault = '';
    let node = '';
    let isRunning = false;

    if (this.props.region) {
      regionName = this.props.region.name;
      regionId = this.props.region.uuid;
      selectDefault = this.props.estateMap.get(this.props.region.uuid).toString();
      node = this.props.region.node;
      isRunning = this.props.region.isRunning;
    }

    return (
      <Modal show={this.props.show} onHide={this.props.dismiss} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Managing Region {regionName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Button onClick={this.onDelete.bind(this)}>Delete {regionName}</Button>
            {this.state.deleteError ? <Alert bsStyle="danger">{this.state.deleteError}</Alert> : <div />}
          </Row>
          <Row>
            <Form>
              <FormGroup>
                <ControlLabel>Change Estate</ControlLabel>
                <FormControl componentClass="select" placeholder="select" defaultValue={selectDefault}>
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
                <FormControl componentClass="select" placeholder="select" defaultValue={node}>
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