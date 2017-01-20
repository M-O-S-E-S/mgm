import * as React from "react";
import { Map } from 'immutable';
import { Action } from 'redux';

import { Region } from '.';
import { Estate } from '../Estates';
import { Host } from '../Hosts';
import { MapPicker } from '../MapPicker';
import { Modal, Form, FormGroup, ControlLabel, FormControl, Button, Grid, Row, Col } from 'react-bootstrap';

interface props {
  show: boolean
  estates: Map<number, Estate>
  regions: Map<string, Region>
  dismiss: () => void,
  dispatch: (a: Action) => void
}

export class AddRegionModal extends React.Component<props, {}> {
  state: {
  }

  constructor(props: props) {
    super(props);
    this.state = {
    }
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
              <FormControl />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Region Coordinates</ControlLabel>
              <MapPicker regions={this.props.regions} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Assigned Estate</ControlLabel>
              <FormControl componentClass="select" placeholder="select">\
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
              </FormGroup>

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.dismiss}>Close</Button>
          </Modal.Footer>
        </Form>
      </Modal >
    )
  }
}