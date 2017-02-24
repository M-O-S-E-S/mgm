import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { JobView } from './JobView';
import { Job, Region } from '../../Immutable';

import { ClientStack } from '../..';
import { ReduxStore } from '../../Redux'

import { Grid, Row, Col } from 'react-bootstrap'
import { BusyButton } from '../BusyButton';

interface props {
  store: ReduxStore,
  jobs: Map<number, Job>,
  regions: Map<string, Region>,
}

export class JobList extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return !shallowequal(this.props, nextProps);
  }

  deleteJob(j: Job): Promise<void> {
    return ClientStack.Job.Destroy(j).then(() => {
      this.props.store.Job.Destroy(j);
    })
  }

  deleteAllJobs(): Promise<void> {
    return Promise.all(
      this.props.jobs.toArray().map((j: Job) => {
        return this.deleteJob(j);
      })
    ).then(() => { }) // eat the Promise<void[]> and return Promise<void>
  }

  render() {
    let jobs = this.props.jobs.toArray()
      .sort((a: Job, b: Job) => { return b.timestamp.valueOf() - a.timestamp.valueOf(); })
      .map((job: Job) => {
        return <JobView key={job.id} job={job} deleteJob={this.deleteJob.bind(this)} regions={this.props.regions} />
      })

    return (
      <Grid>
        <Row>
          <Col md={1}><BusyButton bsSize='xsmall' onClick={this.deleteAllJobs.bind(this)}>Clear All</BusyButton></Col>
          <Col md={1}><strong>Job ID</strong></Col>
          <Col md={2}><strong>Timestamp</strong></Col>
          <Col md={3}><strong>Description</strong></Col>
          <Col md={5}><strong>Status</strong></Col>
        </Row>
        {jobs}
      </Grid>
    )
  }
}