import * as React from "react";
import { Grid, Row, Col, Form, FormGroup, ControlLabel, FormControl, Alert } from 'react-bootstrap';

import { post } from '../../util/network';
import { BusyButton } from '../../util/BusyButton';

export class Password extends React.Component<{}, {}> {
    state: {
        tokenError: string
        tokenSuccess: boolean
        email: string

        setError: string
        setSuccess: boolean
        name: string
        token: string
        password: string
        passwordConfirm: string
    }

    constructor(props: any) {
        super(props);
        this.state = {
            tokenError: '',
            tokenSuccess: false,
            email: '',

            setError: '',
            setSuccess: false,
            name: '',
            token: '',
            password: '',
            passwordConfirm: ''
        }
    }

    // small function to prevent form redirects, as we are using the busybutton below
    eatForm(e: React.FormEvent) {
        e.preventDefault();
    }

    // request password reset token
    onEmail(e: { target: { value: string } }) {
        this.setState({ email: e.target.value })
    }
    requestPasswordReset(): Promise<void> {
        this.setState({
            tokenError: '',
            tokenSuccess: false
        });
        return post('/api/task/resetCode', { email: this.state.email })
            .then(() => {
                this.setState({
                    tokenSuccess: true
                })
            }).catch((err: Error) => {
                console.log('get token failed');
                this.setState({
                    tokenError: err.message
                })
            });
    }

    // use token to reset password
    onName(e: { target: { value: string } }) {
        this.setState({ name: e.target.value })
    }
    onToken(e: { target: { value: string } }) {
        this.setState({ token: e.target.value })
    }
    onPassword(e: { target: { value: string } }) {
        this.setState({ password: e.target.value })
    }
    onPasswordConfirm(e: { target: { value: string } }) {
        this.setState({ passwordConfirm: e.target.value })
    }
    resetPassword() {
        if (this.state.password !== this.state.passwordConfirm) {
            return this.setState({
                setError: 'Passwords do not match'
            });
        }
        this.setState({
            setError: '',
            setSuccess: false
        });
        return post('/api/task/resetPassword', {
            name: this.state.name,
            token: this.state.token,
            password: this.state.password
        })
            .then(() => {
                this.setState({
                    setSuccess: true
                })
            }).catch((err: Error) => {
                console.log('get token failed');
                this.setState({
                    setError: err.message
                })
            });
    }

    render() {
        let tokenErrorMsg = <div></div>
        if (this.state.tokenError) {
            tokenErrorMsg = <Row><Alert bsStyle="danger">{this.state.tokenError}</Alert></Row>
        }
        let tokenSuccessMsg = <div></div>
        if (this.state.tokenSuccess) {
            tokenSuccessMsg = <Row><Alert bsStyle="success">Token requested successfully.</Alert></Row>
        }

        let setErrorMsg = <div></div>
        if (this.state.setError) {
            setErrorMsg = <Row><Alert bsStyle="danger">{this.state.setError}</Alert></Row>
        }
        let setSuccessMsg = <div></div>
        if (this.state.setSuccess) {
            setSuccessMsg = <Row><Alert bsStyle="success">Password updated successfully.</Alert></Row>
        }

        return (
            <div>
                <h3>Request Password Reset Code</h3>
                <hr />
                <Grid>
                    <Row>
                        If you have forgotten your password, enter your email here and we will send you a special code in your email to reset your password.
                    </Row>
                    <Row>
                        <Form onSubmit={this.eatForm.bind(this)}>
                            <FormGroup>
                                <ControlLabel>Email: </ControlLabel>
                                <FormControl placeholder="email" onChange={this.onEmail.bind(this)} />
                            </FormGroup>
                            <BusyButton type="submit" onClick={this.requestPasswordReset.bind(this)}>Request Reset Code</BusyButton>
                        </Form>
                    </Row>
                    {tokenErrorMsg}
                    {tokenSuccessMsg}
                </Grid>
                <h3>Submit Password Reset Code</h3>
                <hr />
                <Grid>
                    <Row>
                        Once you receive your password reset code in your email, enter it here, along with your avatar name, and your new password to complete the password reset.
                    </Row>
                    <Row>
                        <Form onSubmit={this.eatForm.bind(this)}>
                            <FormGroup>
                                <ControlLabel>Avatar Name: </ControlLabel>
                                <FormControl onChange={this.onName.bind(this)} />
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>Token: </ControlLabel>
                                <FormControl onChange={this.onToken.bind(this)} />
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>New Password: </ControlLabel>
                                <FormControl onChange={this.onPassword.bind(this)} type="password"/>
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>New Password again: </ControlLabel>
                                <FormControl onChange={this.onPasswordConfirm.bind(this)} type="password"/>
                            </FormGroup>
                            <BusyButton type="submit" onClick={this.resetPassword.bind(this)}>Update Password</BusyButton>
                        </Form>
                    </Row>
                    {setErrorMsg}
                    {setSuccessMsg}
                </Grid>

            </div>
        )
    }
}