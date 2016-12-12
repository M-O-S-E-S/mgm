import * as React from "react";
import { Store } from 'redux'
import { Estate } from '../Estates';
import { Region, RegionStat } from '.';
const shallowequal = require('shallowequal');

import { post } from '../../util/network';

import { Grid, Row, Col, Button } from 'react-bootstrap';
import { RegionStatView } from './RegionStatView';

interface regionProps {
  region: Region,
  estate: Estate,
  onManage: () => void
}

export class RegionView extends React.Component<regionProps, {}> {

  shouldComponentUpdate(nextProps: regionProps) {
    return !shallowequal(this.props, nextProps);
  }

  start() {
    if (!this.props.region.node || this.props.region.node == '')
      return alertify.error(this.props.region.name + " is not assigned to a host");
    if (this.props.region.isRunning)
      return alertify.error(this.props.region.name + " is already running");
    post('/api/region/start/' + this.props.region.uuid).then(() => {
      alertify.success(this.props.region.name + ' signalled START');
    }).catch( (err: Error) => {
      alertify.error('Could not start ' + this.props.region.name + ': ' + err.message);
    })
    
  }

  render() {
    let statView = <span>~ not running ~</span>;
    if (this.props.region.isRunning) {
      statView = <RegionStatView status={this.props.region.status} />;
    }

    return (
      <Row>
        <Col md={2}><i className="fa fa-cog" aria-hidden="true" onClick={this.props.onManage}></i>   {this.props.region.name}</Col>
        <Col md={2}>{this.props.estate ? this.props.estate.name : '~'}</Col>
        <Col md={1}>
          <i className="fa fa-play" aria-hidden="true" onClick={this.start.bind(this)}></i>
        </Col>
        <Col md={7}>{statView}</Col>
      </Row>
    )
  }
}