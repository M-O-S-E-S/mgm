import * as React from "react";
import { Action } from 'redux'
import { Map, Set, Iterable } from 'immutable';
const shallowequal = require('shallowequal');

import { Estate } from '.';
import { User } from '../Users';
import { BusyButton } from '../../util/BusyButton';
import { post } from '../../util/network';
import { EstateDeletedAction } from '.';

import { Grid, Row, Col, Button } from 'react-bootstrap';


interface props {
  dispatch: (a: Action) => void,
  estate: Estate
  users: Map<string, User>
  managers: Set<string>
  regionCount: number
}

export class EstateView extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return !shallowequal(this.props, nextProps);
  }

  onRemoveEstate(): Promise<void> {
    if (this.props.regionCount != 0) {
      alertify.error('Cannot remove Estate ' + this.props.estate.name + ', there are ' + this.props.regionCount + ' regions assigned');
      return Promise.resolve();
    }
    return post('/api/estate/destroy/' + this.props.estate.id).then( () => {
      alertify.success('Estate ' + this.props.estate.name + ' deleted');
      this.props.dispatch(EstateDeletedAction(this.props.estate.id));
    }).catch((err: Error) => {
      alertify.error('Error deleting '  +this.props.estate.name + ': ' + err.message);
    });
  }

  render() {
    let estateOwner = '';
    if (this.props.estate.owner && this.props.users.get(this.props.estate.owner))
      estateOwner = this.props.users.get(this.props.estate.owner).name;
    let managers: Iterable<string, JSX.Element>;
    if (this.props.managers) {
      managers = this.props.managers.map((uuid) => {
        if (this.props.users.get(uuid)) {
          return <span>{this.props.users.get(uuid).name}</span>
        }
      })
    }
    console.log(this.props);
    return (
      <Row>
        <Col md={3}><BusyButton bsSize='xsmall' onClick={this.onRemoveEstate.bind(this)} >
          <i className="fa fa-trash" aria-hidden="true"></i>
        </BusyButton>  {this.props.estate.name}</Col>
        <Col md={1}>{this.props.regionCount}</Col>
        <Col md={3}>{estateOwner}</Col>
        <Col md={5}>{managers}</Col>
      </Row>
    )
  }
}
