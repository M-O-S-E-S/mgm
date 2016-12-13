import * as React from "react";
import { Store } from 'redux'
import { Estate } from '../Estates';
import { Region, RegionStat } from '.';
const shallowequal = require('shallowequal');

import { post } from '../../util/network';

import { Grid, Row, Col, Button } from 'react-bootstrap';
import { RegionStatView } from './RegionStatView';

interface props {
  isRunning: boolean,
  hasHost: boolean,
  start: () => void,
  stop: () => void,
  content: () => void,
  kill: () => void
}

export class Control extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return !shallowequal(this.props, nextProps);
  }

  render() {
    return (
      <div>
        <Button bsSize="xsmall" disabled={this.props.isRunning} onClick={this.props.start}><i className="fa fa-play" aria-hidden="true" ></i></Button>
        <Button bsSize="xsmall" disabled={!this.props.isRunning} onClick={this.props.stop}><i className="fa fa-stop" aria-hidden="true" ></i></Button>
        <Button bsSize="xsmall" disabled={!this.props.isRunning} onClick={this.props.content}><i className="fa fa-floppy-o" aria-hidden="true" ></i></Button>
        <Button bsSize="xsmall" disabled={!this.props.isRunning} onClick={this.props.kill}><i className="fa fa-times" aria-hidden="true" style={{ color: 'red' }}></i></Button>
      </div>
    )
  }
}