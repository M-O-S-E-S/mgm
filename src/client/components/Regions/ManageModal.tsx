import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { UpsertRegionAction, DeleteRegionAction } from '.';
import { AssignRegionEstateAction } from '../Estates';
import { Region } from '.';
import { Estate } from '../Estates';
import { Host } from '../Hosts';
import { Modal, Form, FormGroup, ControlLabel, FormControl, Row, Col, Alert, Button } from 'react-bootstrap';
import { BusyButton } from '../../util/BusyButton';
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
    selectedEstate: string
    estateError: string
    estateSuccess: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
      deleteError: '',
      selectedEstate: '',
      estateError: '',
      estateSuccess: ''
    }
  }

  onDelete() {
    if (this.props.region.isRunning) {
      return this.setState({
        deleteError: 'Cannot delete a running region'
      });
    }
    if (this.props.region.node !== '') {
      return this.setState({
        deleteError: 'Cannot delete a region that is still assigned a host'
      });
    }
    post('/api/region/destroy/'+this.props.region.uuid).then(() => {
      this.props.dispatch(DeleteRegionAction(this.props.region));
      this.props.dismiss();
    }).catch((err: Error) => {
      this.setState({
        deleteError: 'Cannot delete region: ' + err.message
      })
    });
  }

  onSelectEstate(e: { target: { value: string } }){
    this.setState({
      selectedEstate: e.target.value
    });
  }
  onChangeEstate(): Promise<void> {
    if(this.state.selectedEstate === ''){
      this.setState({
        estateError: 'No estate change detected, not setting'
      });
      return Promise.resolve();
    }
    if(this.props.region.isRunning){
      this.setState({
        estateError: 'Refusing to change estate on running region'
      });
      return Promise.resolve();
    }

    return post('/api/region/estate/'+this.props.region.uuid, {estate: this.state.selectedEstate}).then(() => {
      this.setState({
        estateSuccess: 'Estate Successfully updated',
        estateError: ''
      })

      // update region in redux 
      this.props.dispatch(AssignRegionEstateAction(this.props.region.uuid, parseInt(this.state.selectedEstate,10)));

    }).catch((err: Error) => {
      this.setState({
        estateSuccess: '',
        estateError: 'Cannot change estate: ' + err.message
      })
    });
  }

  onChangeHost(): Promise<void> {

    return Promise.resolve();
  }

  onChangePosition(): Promise<void> {

    return Promise.resolve();
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
            <BusyButton onClick={this.onDelete.bind(this)}>Delete {regionName}</BusyButton>
            {this.state.deleteError ? <Alert bsStyle="danger">{this.state.deleteError}</Alert> : <div />}
          </Row>
          <Row>
            <Form>
              <FormGroup>
                <ControlLabel>Change Estate</ControlLabel>
                <FormControl componentClass="select" placeholder="select" defaultValue={selectDefault} onChange={this.onSelectEstate.bind(this)}>
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
                <BusyButton onClick={this.onChangeEstate.bind(this)}>Set</BusyButton>
                {this.state.estateError ? <Alert bsStyle="danger">{this.state.estateError}</Alert> : <div />}
                {this.state.estateSuccess ? <Alert bsStyle="success">{this.state.estateSuccess}</Alert> : <div />}
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
                <BusyButton onClick={this.onChangeHost.bind(this)}>Set</BusyButton>
              </FormGroup>
            </Form>
          </Row>
          <Row>
            Change Position:
              X:  <input />
            Y:  <input />
            <BusyButton onClick={this.onChangePosition.bind(this)}>Set</BusyButton>
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