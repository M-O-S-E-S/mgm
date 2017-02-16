import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { Region, Estate, Host } from '../../Immutable';
import { MapPicker } from '../MapPicker';
import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Grid, Row, Col, Alert } from 'react-bootstrap';
import { BusyButton } from '../BusyButton';
import { ClientStack } from '../..';
import { ReduxStore } from '../../Redux';

interface props {
  show: boolean
  estates: Map<number, Estate>
  regions: Map<string, Region>
  dismiss: () => void,
  store: ReduxStore
}

export class AddRegionModal extends React.Component<props, {}> {
  state: {
    x: number
    y: number
    name: string
    estate: string
    coordMsg: string
    errorMsg: string
  }

  constructor(props: props) {
    super(props);
    this.state = {
      x: undefined,
      y: undefined,
      name: '',
      estate: '',
      coordMsg: '',
      errorMsg: ''
    }
  }

  componentWillReceiveProps(nextProps: props) {
    if (!nextProps.show) {
      this.setState({
        x: undefined,
        y: undefined,
        name: '',
        estate: '',
        coordMsg: '',
        errorMsg: ''
      })
    }
  }

  onNameChange(e: { target: { value: string } }) {
    this.setState({
      name: e.target.value
    })
  }

  onSelectEstate(e: { target: { value: string } }) {
    this.setState({
      estate: e.target.value
    })
  }

  onCoordinatePick(x: number, y: number, region?: string) {
    if (region === undefined) {
      this.setState({
        x: x,
        y: y,
        coordMsg: x + ', ' + y
      });
    } else {
      this.setState({
        x: undefined,
        y: undefined,
        coordMsg: 'Whoops, region ' + region + ' is already there...'
      })
    }
  }

  onAddRegion(): Promise<void> {
    return ClientStack.Region.Create(this.state.name,this.state.x,this.state.y,this.state.estate).then((uuid: string) => {
      let r = new Region();
      r = r.set('uuid', uuid)
        .set('name', this.state.name)
        .set('x', this.state.x)
        .set('y', this.state.y);
      this.props.store.Region.Update(r);
      this.props.dismiss();
    }).catch((err: Error) => {
      this.setState({
        errorMsg: 'Error creating region: ' + err.message
      })
    })
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.dismiss} bsSize="large">
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>Create a new region</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <FormGroup>
              <ControlLabel>Region Name</ControlLabel>
              <FormControl onChange={this.onNameChange.bind(this)} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Region Coordinates ({this.state.coordMsg})</ControlLabel>
              <MapPicker regions={this.props.regions} onPick={this.onCoordinatePick.bind(this)} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Assigned Estate</ControlLabel>
              <FormControl componentClass="select" placeholder="select" onChange={this.onSelectEstate.bind(this)}>
                <option key={-1} value="">select one</option>
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
            </FormGroup>
            {this.state.errorMsg ? <Alert bsStyle="danger">{this.state.errorMsg}</Alert> : <div />}
          </Modal.Body>
          <Modal.Footer>
            <BusyButton onClick={this.onAddRegion.bind(this)}>Submit</BusyButton>
            <Button onClick={this.props.dismiss}>Close</Button>
          </Modal.Footer>
        </Form>
      </Modal >
    )
  }
}