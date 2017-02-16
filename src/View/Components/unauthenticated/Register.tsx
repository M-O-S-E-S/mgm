import * as React from "react";

import { Grid, Row, Col, Form, FormGroup, ControlLabel, FormControl, Alert, Button, Radio } from 'react-bootstrap';

import { ClientStack } from '../..';
import { BusyButton } from '../BusyButton';

export class Register extends React.Component<{}, {}> {
    state: {
        stage: string
        error: string

        fName: string
        lName: string
        email: string
        password: string
        passwordConfirm: string
        gender: string
        summary: string
    }

    constructor(props: any) {
        super(props);
        this.state = {
            stage: 'eupa',
            error: '',
            fName: '',
            lName: '',
            email: '',
            password: '',
            passwordConfirm: '',
            gender: '',
            summary: ''
        }
    }

    // small function to prevent form redirects, as we are using the busybutton below
    eatForm(e: React.FormEvent) {
        e.preventDefault();
    }

    acceptEupa() {
        this.setState({
            stage: 'form'
        })
    }

    onFirstName(e: { target: { value: string } }) {
        this.setState({ fName: e.target.value });
    }
    onLastName(e: { target: { value: string } }) {
        this.setState({ lName: e.target.value });
    }
    onEmail(e: { target: { value: string } }) {
        this.setState({ email: e.target.value });
    }
    onPassword(e: { target: { value: string } }) {
        this.setState({ password: e.target.value });
    }
    onPasswordConfirm(e: { target: { value: string } }) {
        this.setState({ passwordConfirm: e.target.value });
    }
    onSummary(e: { target: { value: string } }) {
        this.setState({ summary: e.target.value });
    }
    onGender(e: { target: { value: string } }) {
        this.setState({ gender: e.target.value });
    }
    submitApplication(): Promise<void> {
        if (this.state.password !== this.state.passwordConfirm) {
            this.setState({
                error: 'Passwords do not match'
            });
            return Promise.resolve();
        }
        this.setState({
            error: ''
        });
        return ClientStack.SubmitRegistration(
            this.state.fName + ' ' + this.state.lName,
            this.state.email,
            this.state.gender,
            this.state.password,
            this.state.summary
        ).then(() => {
            this.setState({
                stage: 'success'
            })
        }).catch((err: Error) => {
            this.setState({
                error: err.message
            })
        });
    }

    eupa = (
        <Grid>
            <Row><h1>The Military Open Simulator Enterprise Strategy</h1></Row>
            <Row>
                <h3>High Level Overview</h3>
                <p>MOSES is a strategy for deploying an OpenSimulator based experimentation platform for military training.  It involves a client software piece that you must install to participate and requires an active internet connection to communicate with the simulation servers located at the US Army Research Laboratory Simulation and Training Technology Center.  By agreeing to the End User Participation Agreement below and registering on the next page, you are applying for an account to participate in-world in MOSES.  You must use your legal name and a valid email address.  Applying for an account does not automatically grant you access.  In the following page, you will be given the opportunity to briefly summarize your work and why you wish to be a MOSES participant.</p>
                <h3>Participation Agreement Synopsis</h3>
                <p>It is highly recommended that you read and understand the participation agreement below before clicking the "I Agree" button. Here is a brief synopsis:</p>
                <ol>
                    <li>The participation agreement below outlines the MOSES code of conduct.  All participants will behave in a professional manner and treat the MOSES grid as if they were actually visiting the ARL Simulation and Technology Center.</li>
                    <li>Minimum participation qualifications and eligibility as well as roles and responsibilities.</li>
                    <li>Terms of participation and release or termination.</li>
                    <li>Explanation of Intellectual Property rights.</li>
                </ol>
            </Row>
            <Row>
                <a href="/files/eupa.pdf" target="_self">View/Save PDF copy</a>
            </Row>
            <Row>
                <iframe src="/files/eupa.html" width="100%" height="600"></iframe>
            </Row>
            <Button bsStyle="success" onClick={this.acceptEupa.bind(this)}>I Agree</Button>
        </Grid>
    )
    form = (
        <Grid>
            <form onSubmit={this.eatForm.bind(this)}>
                <Row><h3>Application</h3></Row>
                <Row><p>This is an application for an avatar account in the MOSES Grid.
                Your legal first name and your legal last name is your avatar name.
                Please complete the form below and press the Apply button to apply for a MOSES account.</p></Row>
                <Row>
                    <FormGroup>
                        <ControlLabel>Applicant Legal First Name: </ControlLabel>
                        <FormControl onChange={this.onFirstName.bind(this)} />
                    </FormGroup>
                </Row>
                <Row>
                    <FormGroup>
                        <ControlLabel>Applicant Legal Last Name: </ControlLabel>
                        <FormControl onChange={this.onLastName.bind(this)} />
                    </FormGroup>
                </Row>
                <Row>
                    <FormGroup>
                        <ControlLabel>Applicant Email: </ControlLabel>
                        <FormControl onChange={this.onEmail.bind(this)} />
                    </FormGroup>
                </Row>
                <Row>
                    <FormGroup>
                        <ControlLabel>Applicant Password: </ControlLabel>
                        <FormControl type="password" onChange={this.onPassword.bind(this)} />
                    </FormGroup>
                </Row>
                <Row>
                    <FormGroup>
                        <ControlLabel>Applicant Password Confirm: </ControlLabel>
                        <FormControl type="password" onChange={this.onPasswordConfirm.bind(this)} />
                    </FormGroup>
                </Row>
                <Row>
                    <FormGroup>
                        <ControlLabel>Applicant Gender (Legal Sex): </ControlLabel>
                        <Radio name="gender" value="M" onChange={this.onGender.bind(this)} inline>Male</Radio>
                        <Radio name="gender" value="F" onChange={this.onGender.bind(this)} inline>Female</Radio>
                    </FormGroup>
                </Row>
                <Row>
                    <FormGroup>
                        <ControlLabel>Summarize why you would like to join the MOSES Project, and discuss relavant work where appropriate: </ControlLabel>
                        <FormControl componentClass="textarea" onChange={this.onSummary.bind(this)} />
                    </FormGroup>
                </Row>
                <BusyButton type="submit" bsStyle="success" onClick={this.submitApplication.bind(this)}>Apply</BusyButton>
            </form>
        </Grid>
    )
    success = (
        <Grid>
            <Row>
                <h3>Registration Successful!</h3>
            </Row>
            <Row>
                <p>Thank you for registering.  We have notified the grid admins of your pending application.  They will review and approve/deny your account.  You will receive further email notifyinh you of any decision.</p>
            </Row>
        </Grid>
    )
    render() {
        let errorMsg = <div></div>
        if (this.state.error) {
            errorMsg = <Row><Alert bsStyle="danger">{this.state.error}</Alert></Row>
        }
        switch (this.state.stage) {
            case 'eupa':
                return this.eupa;
            case 'form':
                return (
                    <div>
                        {this.form}
                        <Grid>{errorMsg}</Grid>
                    </div>
                );
            case 'success':
                return this.success;
            default:
                return <Alert bsStyle="danger">An error occurred, please reload the page</Alert>;
        }
    }
}