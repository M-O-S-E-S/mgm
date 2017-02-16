import * as React from "react";
import { Action } from 'redux'
import { Map, Set, Iterable } from 'immutable';
const shallowequal = require('shallowequal');

import { Estate, User } from '../../Immutable';
import { BusyButton } from '../BusyButton';
import { ClientStack } from '../..';
import { ReduxStore } from '../../Redux';

import { Grid, Row, Col, Button } from 'react-bootstrap';


interface props {
  store: ReduxStore,
  estate: Estate
  users: Map<string, User>
  managers: Set<string>
  regionCount: number
  isAdmin: boolean
}

export class EstateView extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return !shallowequal(this.props, nextProps);
  }

  onRemoveEstate(): Promise<void> {
    if (this.props.regionCount != 0) {
      alertify.error('Cannot remove Estate ' + this.props.estate.EstateName + ', there are ' + this.props.regionCount + ' regions assigned');
      return Promise.resolve();
    }
    return ClientStack.Estate.Destroy(this.props.estate).then(() => {
      alertify.success('Estate ' + this.props.estate.EstateName + ' deleted');
      this.props.store.Estate.Destroy(this.props.estate);
    }).catch((err: Error) => {
      alertify.error('Error deleting ' + this.props.estate.EstateName + ': ' + err.message);
    });
  }

  render() {
    let estateOwner = '';
    if (this.props.estate.EstateOwner && this.props.users.get(this.props.estate.EstateOwner))
      estateOwner = this.props.users.get(this.props.estate.EstateOwner).name();
    let managers: Iterable<string, JSX.Element>;
    if (this.props.managers) {
      managers = this.props.managers.map((uuid) => {
        if (this.props.users.get(uuid)) {
          return <span key={this.props.estate.EstateID + '_' + uuid}>{this.props.users.get(uuid).name}</span>
        }
      })
    }

    return (
      <Row>
        <Col md={3}>
          {this.props.isAdmin ?
            <BusyButton bsSize='xsmall' onClick={this.onRemoveEstate.bind(this)} >
              <i className="fa fa-trash" aria-hidden="true"></i>
            </BusyButton> :
            <span />
          }
          {this.props.estate.EstateName}
        </Col>
        <Col md={1}>{this.props.regionCount}</Col>
        <Col md={3}>{estateOwner}</Col>
        <Col md={5}>{managers}</Col>
      </Row>
    )
  }
}
