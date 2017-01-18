import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { JobView } from './JobView';
import { Job } from '.';

import { Grid, Row, Col } from 'react-bootstrap'

interface props {
  dispatch: (a: Action) => void,
  jobs: Map<number, Job>
}

export class JobList extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return !shallowequal(this.props.jobs, nextProps.jobs);
  }

  render() {
    let jobs = this.props.jobs.toList().map((job: Job) => {
      return <JobView key={job.id} job={job} />
    })

    return (
      <Grid>
        <Row>
          <Col md={1}><strong>Job ID</strong></Col>
          <Col md={2}><strong>Timestamp</strong></Col>
          <Col md={2}><strong>Description</strong></Col>
          <Col md={7}><strong>Status</strong></Col>
        </Row>
        {jobs}
      </Grid>
    )
  }
}