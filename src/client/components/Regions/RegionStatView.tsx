import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';

import { Region, RegionStat } from '.';

import { Col } from 'react-bootstrap';

interface props {
  status: string
}

interface Status {
  memPercent: number 
  timestamp: number 
  uptime: number 
  cpuPercent: number 
  memKB: number
}

export class RegionStatView extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return this.props.status !== nextProps.status;
  }

  secondsToUptime(dt: number): string {
    return 'up man';
  }

  render() {
    if (!this.props.status || this.props.status === '')
      return <span>~ no data ~</span>

    let status: Status = JSON.parse(this.props.status)

    let now = new Date().getTime()/1000;
    if(now - status.timestamp > 60)
      return <span>~ stale data ~</span>

    //CPU
    //MEM
    //UPTIME
    let mem = status.memKB / 1073741824;

    return (
      <div>
        <Col md={4}>CPU: {status.cpuPercent}</Col>
        <Col md={4}>RAM: {status.memPercent.toFixed(2)}% [{mem.toFixed(2)}GiB]</Col>
        <Col md={4}>UP: {this.secondsToUptime(status.uptime)}</Col>
      </div>
    )

    // convert to MiBps, these are also reversed from psutil for unknown reasons
    /*let upload = this.props.status.netSentPer / 1048576;
    let download = this.props.status.netRecvPer / 1048576;
    let mem = this.props.status.memKB / 1073741824;
    let cpus = this.props.status.cpuPercent.map((p, idx) => {
      let c = 255 - Math.floor((p / 100) * 255)
      if (c > 248) c = 248;
      if (c < 0) c = 0;
      let colorCode = c.toString(16);
      return <i key={idx} className="fa fa-square" aria-hidden="true" style={ {color: '#'+colorCode+colorCode+colorCode} }></i>
    });

    return (
      <div>
        <Col md={4}>CPU: {cpus}</Col>
        <Col md={4}>RAM: {this.props.status.memPercent.toFixed(2)}% [{mem.toFixed(2)}GiB]</Col>
        <Col md={4}>NET: {download.toFixed(2)}<i className="fa fa-arrow-down" aria-hidden="true"></i> {upload.toFixed(2)}<i className="fa fa-arrow-up" aria-hidden="true"></i> MiB/s</Col>
      </div>
    )*/
  }
}
