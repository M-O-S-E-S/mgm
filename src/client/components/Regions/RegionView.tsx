import * as React from "react";
import { Store } from 'redux'
import { Estate } from '../Estates';
import { Region, RegionStat } from '.';
const shallowequal = require('shallowequal');

import { post } from '../../util/network';

import { Grid, Row, Col, Button } from 'react-bootstrap';
import { RegionStatView } from './RegionStatView';
import { Control } from './Control';

interface regionProps {
  region: Region,
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
    }).catch((err: Error) => {
      alertify.error('Could not start ' + this.props.region.name + ': ' + err.message);
    })
  }

  stop() {
    if (!this.props.region.isRunning) {
      return alertify.error('Cannot stop a region that is not running');
    }
    post('/api/region/stop/' + this.props.region.uuid).then(() => {
      alertify.success(this.props.region.name + ' signalled STOP');
    }).catch((err: Error) => {
      alertify.error('Could not stop ' + this.props.region.name + ': ' + err.message);
    })
  }

  content() { alertify.log('content pressed'); }

  kill() {
    if (!this.props.region.isRunning) {
      return alertify.error('Cannot kill a region that is not running');
    }
    post('/api/region/kill/' + this.props.region.uuid).then(() => {
      alertify.success(this.props.region.name + ' signalled KILL');
    }).catch((err: Error) => {
      alertify.error('Could not kill ' + this.props.region.name + ': ' + err.message);
    })
  }

  render() {
    let statView = <span>~ not running ~</span>;
    if (this.props.region.isRunning) {
      statView = <RegionStatView status={this.props.region.status} />;
    }

    return (
      <Row>
        <Col xs={6} sm={6} md={6} lg={2}>
          <Row>
            <Col xs={1}><i className="fa fa-cog" aria-hidden="true" onClick={this.props.onManage}></i></Col>
            <Col xs={8}>{this.props.region.name}</Col>
            <Col xs={1}><i className="fa fa-file-text-o" aria-hidden="true" ></i></Col>
          </Row>
        </Col>
        <Col xs={6} sm={6} md={6} lg={2}>
          <Control
            isRunning={this.props.region.isRunning}
            hasHost={this.props.region.node !== ''}
            start={this.start.bind(this)}
            stop={this.stop.bind(this)}
            content={this.content.bind(this)}
            kill={this.kill.bind(this)} />
        </Col>
        <Col xs={12} md={8} lg={8}>{statView}</Col>
      </Row>
    )
  }
}