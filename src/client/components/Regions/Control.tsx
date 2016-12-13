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
  hasHost: boolean
}

export class Control extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return !shallowequal(this.props, nextProps);
  }

  /*start() {
    if (!this.props.region.node || this.props.region.node == '')
      return alertify.error(this.props.region.name + " is not assigned to a host");
    if (this.props.region.isRunning)
      return alertify.error(this.props.region.name + " is already running");
    post('/api/region/start/' + this.props.region.uuid).then(() => {
      alertify.success(this.props.region.name + ' signalled START');
    }).catch( (err: Error) => {
      alertify.error('Could not start ' + this.props.region.name + ': ' + err.message);
    })
  }*/

  render() {

    return (
      <div class="col-md-12">
        <Button bsSize="xsmall"><i className="fa fa-play" aria-hidden="true" ></i></Button>
        <Button bsSize="xsmall"><i className="fa fa-stop" aria-hidden="true" ></i></Button>
        <Button bsSize="xsmall"><i className="fa fa-times" aria-hidden="true" style={{color: 'red'}}></i></Button>
        <Button bsSize="xsmall"><i className="fa fa-floppy-o" aria-hidden="true" ></i></Button>
        <Button bsSize="xsmall"><i className="fa fa-file-text-o" aria-hidden="true" ></i></Button>
      </div>
    )
  }
}