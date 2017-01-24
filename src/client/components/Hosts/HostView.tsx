import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { Host, HostStat } from '.'
import { Region } from '../Regions';

import { Grid, Row, Col, Button } from 'react-bootstrap';
import { HostStatView } from './HostStatView';
import { HostDeletedAction } from '.';

import { BusyButton } from '../../util/BusyButton';
import { post } from '../../util/network';


interface props {
  dispatch: (a: Action) => void,
  host: Host
  regions: Map<string, Region>
}

export class HostView extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return !shallowequal(this.props, nextProps);
  }

  onRemoveHost(): Promise<void> {
    let regionCount = 0;
    this.props.regions.toList().map((r: Region) => {
      if (r.node === this.props.host.address)
        regionCount++;
    })
    if (regionCount != 0) {
      alertify.error('Cannot remove host ' + this.props.host.address + ', there are ' + regionCount + ' regions assigned');
      return Promise.resolve();
    }
    return post('/api/host/remove', { host: this.props.host.address }).then(() => {
      alertify.success('Host ' + this.props.host.address + ' deleted');
      this.props.dispatch(HostDeletedAction(this.props.host.id));
    }).catch((err: Error) => {
      alertify.error('Error deleting host ' + this.props.host.address + ': ' + err.message);
    })
  }

  render() {
    let regionCount = 0;
    this.props.regions.toList().map((r: Region) => {
      if (r.node === this.props.host.address)
        regionCount++;
    })
    return (
      <Row>
        <Col md={2}><BusyButton bsSize="xsmall" onClick={this.onRemoveHost.bind(this)}><i className="fa fa-trash" aria-hidden="true"></i></BusyButton>   {this.props.host.name}</Col>
        <Col md={1}>{this.props.host.address}</Col>
        <Col md={1}>{regionCount}</Col>
        <Col md={8}><HostStatView status={this.props.host.status} /></Col>
      </Row>
    )
  }
}
