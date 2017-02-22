import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { Region, Estate, Host, EstateMap } from '../../Immutable';
import { Modal, Form, FormGroup, ControlLabel, FormControl, Row, Col, Alert, Button } from 'react-bootstrap';
import { BusyButton } from '../BusyButton';
import { ClientStack } from '../..';
import { ReduxStore, StateModel } from '../../Redux';
import { MapPicker } from '../MapPicker';


interface props {
  show: boolean
  region: Region,
  estates: Map<number, Estate>
  estateMap: Map<string, number>,
  hosts: Map<number, Host>,
  regions: Map<string, Region>,
  dismiss: () => void,
  store: ReduxStore
}

const ipRegExp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

export class ManageModal extends React.Component<props, {}> {
  state: {
    deleteError: string
    selectedEstate: string
    estateError: string
    estateSuccess: string
    selectedHost: string
    hostError: string
    hostSuccess: string
    x: number
    y: number
    coordMessage: string
    pickingCoords: boolean
    coordsSuccess: string
    coordsError: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
      deleteError: '',
      selectedEstate: '',
      estateError: '',
      estateSuccess: '',
      selectedHost: '',
      hostError: '',
      hostSuccess: '',
      x: undefined,
      y: undefined,
      coordMessage: '',
      pickingCoords: false,
      coordsSuccess: '',
      coordsError: ''
    }
  }

  componentWillReceiveProps(nextProps: props) {
    if (nextProps.region) {
      this.setState({
        x: nextProps.region.x,
        y: nextProps.region.y
      })
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
    ClientStack.Region.Destroy(this.props.region).then(() => {
      this.props.store.Region.Destroy(this.props.region);
      this.props.dismiss();
    }).catch((err: Error) => {
      this.setState({
        deleteError: 'Cannot delete region: ' + err.message
      })
    });
  }

  onSelectEstate(e: { target: { value: string } }) {
    this.setState({
      selectedEstate: e.target.value
    });
  }
  onChangeEstate(): Promise<void> {
    if (this.state.selectedEstate === '') {
      this.setState({
        estateError: 'No estate change detected, not setting'
      });
      return Promise.resolve();
    }
    if (this.props.region.isRunning) {
      this.setState({
        estateError: 'Refusing to change estate on running region'
      });
      return Promise.resolve();
    }

    return ClientStack.Region.AssignEstate(this.props.region, this.props.estates.get(parseInt(this.state.selectedEstate))).then(() => {
      this.setState({
        estateSuccess: 'Estate Successfully updated',
        estateError: ''
      })

      // update region in redux 
      let m = new EstateMap()
        .set('EstateID', this.state.selectedEstate)
        .set('RegionID', this.props.region.uuid);
      this.props.store.EstateMap.Update(m);

    }).catch((err: Error) => {
      this.setState({
        estateSuccess: '',
        estateError: 'Cannot change estate: ' + err.message
      })
    });
  }

  onSelectHost(e: { target: { value: string } }) {
    this.setState({
      selectedHost: e.target.value
    });
  }
  onChangeHost(): Promise<void> {
    if (this.state.selectedHost === this.props.region.node) {
      this.setState({
        hostSuccess: '',
        hostError: 'No host change detected, not setting'
      });
      return Promise.resolve();
    }
    if (this.props.region.isRunning) {
      this.setState({
        hostSuccess: '',
        hostError: 'Refusing to change estate on running region'
      });
      return Promise.resolve();
    }

    return ClientStack.Region.AssignHost(this.props.region, this.props.hosts.get(parseInt(this.state.selectedHost))).then(() => {
      this.setState({
        hostSuccess: 'Host Successfully assigned',
        hostError: ''
      })

      // update region in redux 
      this.props.store.Region.Update(this.props.region.set('node', this.state.selectedHost));

    }).catch((err: Error) => {
      this.setState({
        estateSuccess: '',
        estateError: 'Cannot change estate: ' + err.message
      })
    });
  }

  openPick() {
    this.setState({
      pickingCoords: true
    })
  }
  onCoordinatePick(x: number, y: number, region: string) {
    if (region) {
      this.setState({
        x: undefined,
        y: undefined,
        coordMessage: region
      })
    } else {
      this.setState({
        x: x,
        y: y,
        coordMessage: ''
      })
    }
  }
  onChangePosition(): Promise<void> {
    if (this.props.region.isRunning) {
      this.setState({
        coordsSuccess: '',
        coordsError: 'Refusing to change coordinates on running region'
      });
      return Promise.resolve();
    }
    if (this.props.region.x === this.state.x && this.props.region.y === this.state.y) {
      this.setState({
        coordsSuccess: '',
        coordsError: 'No coordinate change detected, not updating'
      });
      return Promise.resolve();
    }

    this.setState({
      pickingCoords: false,
      coordsSuccess: '',
      coordsError: ''
    })

    return ClientStack.Region.SetCoordinates(this.props.region, this.state.x, this.state.y).then(() => {
      this.setState({
        coordsSuccess: 'Coordinates Successfully Changed',
        coordsError: ''
      })

      // update region in redux 
      this.props.store.Region.Update(this.props.region.set('x', this.state.x).set('y', this.state.y));

    }).catch((err: Error) => {
      this.setState({
        estateSuccess: '',
        estateError: 'Cannot change estate: ' + err.message
      })
    });
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
                        key={e.EstateID.toString()}
                        value={e.EstateID.toString()}>
                        {e.EstateName}
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
                <FormControl componentClass="select" placeholder="select" defaultValue={node} onChange={this.onSelectHost.bind(this)}>
                  <option key={-1} value={''}>unassigned</option>
                  {this.props.hosts.toArray().map((h: Host) => {
                    return <option
                      key={h.address}
                      value={h.id.toString()}>
                      {h.name}
                    </option>
                  })}
                </FormControl>
                <BusyButton onClick={this.onChangeHost.bind(this)}>Set</BusyButton>
                {this.state.hostError ? <Alert bsStyle="danger">{this.state.hostError}</Alert> : <div />}
                {this.state.hostSuccess ? <Alert bsStyle="success">{this.state.hostSuccess}</Alert> : <div />}
              </FormGroup>
            </Form>
          </Row>
          <Row>
            <FormGroup>
              <ControlLabel>Region Coordinates ({this.state.coordMessage ? this.state.coordMessage : this.state.x + ', ' + this.state.y})</ControlLabel>
              <BusyButton onClick={this.onChangePosition.bind(this)}>Set</BusyButton>
              {this.state.pickingCoords ?
                <MapPicker regions={this.props.regions} onPick={this.onCoordinatePick.bind(this)} /> :
                <Button onClick={this.openPick.bind(this)}>Pick Coordinates</Button>
              }
              {this.state.coordsError ? <Alert bsStyle="danger">{this.state.coordsError}</Alert> : <div />}
              {this.state.coordsSuccess ? <Alert bsStyle="success">{this.state.coordsSuccess}</Alert> : <div />}
            </FormGroup>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.dismiss}>Close</Button>
        </Modal.Footer>
      </Modal >
    )
  }
}