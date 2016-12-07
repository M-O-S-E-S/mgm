import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';

import { Host, HostStat } from '.'
import { Region } from '../Regions';

import { Grid, Row, Col, Button } from 'react-bootstrap';
import { HostStatView } from './HostStatView';

interface props {
  dispatch: (a: Action) => void,
  host: Host
  status: HostStat
  regions: Map<string, Region>
}

export class HostView extends React.Component<props, {}> {

  onRemoveHost() {
    let regionCount = 0;
    this.props.regions.toList().map((r: Region) => {
      if (r.slaveAddress === this.props.host.address)
        regionCount++;
    })
    if (regionCount != 0) {
      return alertify.error('Cannot remove host ' + this.props.host.address + ', there are ' + regionCount + ' regions assigned');
    }
    alertify.confirm('Are you sure you want to remove host ' + this.props.host.address + '?', () => {
      //RequestDeleteHost(this.props.host);
      alertify.error('not implemented');
    });
  }

  render() {
    let regionCount = 0;
    this.props.regions.toList().map((r: Region) => {
      if (r.slaveAddress === this.props.host.address)
        regionCount++;
    })
    return (
      <Row>
        <Col md={2}><i className="fa fa-trash" aria-hidden="true" onClick={this.onRemoveHost.bind(this)}></i>   {this.props.host.name}</Col>
        <Col md={1}>{this.props.host.address}</Col>
        <Col md={1}>{regionCount}</Col>
        <Col md={8}><HostStatView status={this.props.status} /></Col>
      </Row>
    )
  }
}
