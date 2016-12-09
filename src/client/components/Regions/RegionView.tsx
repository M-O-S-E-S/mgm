import * as React from "react";
import { Store } from 'redux'
import { Estate } from '../Estates';
import { Region, RegionStat } from '.';

import { Grid, Row, Col, Button } from 'react-bootstrap';
import { RegionStatView } from './RegionStatView';

interface regionProps {
  region: Region,
  estate: Estate,
  onManage: () => void
}

export class RegionView extends React.Component<regionProps, {}> {

  start(){
    if(! this.props.region.node || this.props.region.node == '')
      return alertify.error(this.props.region.name + " is not assigned to a host");
    if(this.props.region.isRunning)
      return alertify.error(this.props.region.name + " is already running");
    //RequestStartRegion(this.props.region);
    alertify.error('not implemented');
  }

  render() {
    let statView = <span>~ not running ~</span>;
    if(this.props.region.isRunning){
      statView = <RegionStatView status={this.props.region.status}/>;
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