import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';

import { Host, HostStat } from '.'
import { Region } from '../Regions';

import { Col } from 'react-bootstrap';

interface props {
  status: string
}

export class HostStatView extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return this.props.status !== nextProps.status;
  }

  render() {
    if (!this.props.status || this.props.status === '')
      return <span>~ not connected to this instance ~</span>

    let status = JSON.parse(this.props.status);

    let now = new Date().getTime()/1000;
    if(now - status.timestamp > 60)
      return <span>~ not connected to this instance ~</span>

    // convert to MiBps, these are also reversed from psutil for unknown reasons
    let upload = status.netSentPer / 1048576;
    let download = status.netRecvPer / 1048576;
    let mem = status.memKB / 1073741824;
    let cpus = status.cpuPercent.map((p: number, idx: number) => {
      let c = 255 - Math.floor((p / 100) * 255)
      if (c > 248) c = 248;
      if (c < 0) c = 0;
      let colorCode = c.toString(16);
      return <i key={idx} className="fa fa-square" aria-hidden="true" style={ {color: '#'+colorCode+colorCode+colorCode} }></i>
    });

    return (
      <div>
        <Col md={4}>CPU: {cpus}</Col>
        <Col md={4}>RAM: {status.memPercent.toFixed(2)}% [{mem.toFixed(2)}GiB]</Col>
        <Col md={4}>NET: {download.toFixed(2)}<i className="fa fa-arrow-down" aria-hidden="true"></i> {upload.toFixed(2)}<i className="fa fa-arrow-up" aria-hidden="true"></i> MiB/s</Col>
      </div>
    )
  }
}
