import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { Job } from '.';
import { User } from '../Users';
import { post } from '../../util/network';

import { Grid, Row, Col, Button } from 'react-bootstrap';

import { JobList } from './JobList';
import { SetPasswordModal } from './SetPasswordModal';

interface props {
    dispatch: (a: Action) => void,
    user: User
    jobs: Map<number, Job>
}

interface state {
    showPasswordModal: boolean
}

export class Account extends React.Component<props, {}> {
    state: state

    constructor(props: props) {
        super(props);
        this.state = {
            showPasswordModal: false
        }
    }

    shouldComponentUpdate(nextProps: props, nextState: state) {
        return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState);
    }

    handleNewPassword(password: string): Promise<void> {
        return post('/api/auth/changePassword', { password: password }).then(() => {
            this.setState({
                showPasswordModal: false
            })
        });
    }

    showNewPassword() {
        this.setState({
            showPasswordModal: true
        })
    }

    cancelNewPassword() {
        this.setState({
            showPasswordModal: false
        })
    }

    render() {
        return (
            <Grid>
                <Row>
                    <Col md={6}>Avatar Name</Col>
                    <Col md={6}>{this.props.user.name}</Col>
                </Row>
                <Row>
                    <Col md={6}>Avatar User Level</Col>
                    <Col md={6}>{this.props.user.godLevel}</Col>
                </Row>
                <Row>
                    <Col md={6}>User Email</Col>
                    <Col md={6}>{this.props.user.email}</Col>
                </Row>
                <hr />
                <Button onClick={this.showNewPassword.bind(this)} disabled={this.state.showPasswordModal}>Set Password</Button>
                <SetPasswordModal show={this.state.showPasswordModal} submit={this.handleNewPassword.bind(this)} cancel={this.cancelNewPassword.bind(this)} />
                <hr />
                <JobList dispatch={this.props.dispatch} jobs={this.props.jobs} />
            </Grid>
        )
    }
}
