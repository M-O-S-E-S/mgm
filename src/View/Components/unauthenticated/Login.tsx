import * as React from "react";
import { Action } from 'redux'

import { Splash } from "../Splash";

import { ReduxStore } from '../../Redux';
import { User } from '../../Immutable';

import { ClientStack, LoginResponse } from '../..';

import { Grid, Row, Col, Form, FormGroup, FormControl, ControlLabel, Button, Alert } from "react-bootstrap"


interface loginProps {
    store: ReduxStore,
    errorMsg: string
}

export class Login extends React.Component<loginProps, {}> {

    state: {
        username: string,
        password: string
    }

    constructor(props: loginProps) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    onUsername(e: { target: { value: string } }) {
        this.setState({ username: e.target.value })
    }
    onPassword(e: { target: { value: string } }) {
        this.setState({ password: e.target.value })
    }
    handleLogin(e: React.FormEvent) {
        e.preventDefault();
        ClientStack.Login(this.state.username, this.state.password)
            .then((res: LoginResponse) => {
                console.log('auth succeeded');
                this.props.store.Auth.Login(res.uuid, res.isAdmin, res.token);
                if (window.location.pathname === "" || window.location.pathname === "/" || window.location.pathname === '/login')
                    this.props.store.NavigateTo('/account');
            }).catch((err: Error) => {
                console.log('auth failed');
                this.props.store.Auth.LoginError(err.message);
            });
    }

    render() {
        let errorMsg = <div></div>
        if (this.props.errorMsg) {
            errorMsg = <Row><Alert bsStyle="danger">{this.props.errorMsg}</Alert></Row>
        }
        return (
            <div>
                <Grid>
                    <Row>
                        <Form inline={true} onSubmit={this.handleLogin.bind(this)}>
                            <Col md={4}>
                                <ControlLabel>Username: </ControlLabel>
                                <FormControl placeholder="username" onChange={this.onUsername.bind(this)} />
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <ControlLabel>Password: </ControlLabel>
                                    <FormControl type="password" onChange={this.onPassword.bind(this)} />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <Button type="submit">Login</Button>
                            </Col>
                        </Form>

                    </Row>
                    {errorMsg}
                </Grid>
                <Splash />
            </div>
        )
    }
}