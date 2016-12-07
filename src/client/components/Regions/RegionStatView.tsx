import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';

import { Region, RegionStat } from '.';

import { Col } from 'react-bootstrap';

interface props {
  status: RegionStat
}

export class RegionStatView extends React.Component<props, {}> {

  render() {
    if (!this.props.status)
      return <span>~ no data ~</span>
    let now = new Date().getTime()/1000;
    if(now - this.props.status.stats.timestamp > 60)
      return <span>~ stale data ~</span>
    
    if(! this.props.status.running)
      return <span>~ not running ~</span>

    //CPU
    //MEM
    //UPTIME
    let mem = this.props.status.stats.memKB / 1073741824;

    return (
      <div>
        <Col md={4}>CPU: {this.props.status.stats.cpuPercent}</Col>
        <Col md={4}>RAM: {this.props.status.stats.memPercent.toFixed(2)}% [{mem.toFixed(2)}GiB]</Col>
        <Col md={4}>UP: {this.props.status.stats.uptime}</Col>
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
