import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { JobView } from './JobView';
import { Job } from '.';

import { post } from '../../util/network';

import { Grid, Row, Col } from 'react-bootstrap'
import { BusyButton } from '../../util/BusyButton';

import { DeleteJobAction } from './JobsRedux';

interface props {
  dispatch: (a: Action) => void,
  jobs: Map<number, Job>
}

export class JobList extends React.Component<props, {}> {

  shouldComponentUpdate(nextProps: props) {
    return !shallowequal(this.props.jobs, nextProps.jobs);
  }

  deleteJob(j: Job): Promise<void> {
    console.log('delete job ' + j.id);
    return post('/api/task/delete/' + j.id).then(() => {
      this.props.dispatch(DeleteJobAction(j));
    })
  }

  deleteAllJobs(): Promise<void> {
    console.log('delete all jobs here');
    return Promise.all(
      this.props.jobs.toArray().map((j: Job) => {
        return this.deleteJob(j);
      })
    ).then(() =>{}) // eat the Promise<void[]> and return Promise<void>
  }

  render() {
    let jobs = this.props.jobs.toList().map((job: Job) => {
      return <JobView key={job.id} job={job} deleteJob={this.deleteJob.bind(this)} />
    })

    return (
      <Grid>
        <Row>
          <Col md={1}><BusyButton bsSize='xsmall' onClick={this.deleteAllJobs.bind(this)}>Clear All</BusyButton></Col>
          <Col md={1}><strong>Job ID</strong></Col>
          <Col md={2}><strong>Timestamp</strong></Col>
          <Col md={2}><strong>Description</strong></Col>
          <Col md={6}><strong>Status</strong></Col>
        </Row>
        {jobs}
      </Grid>
    )
  }
}