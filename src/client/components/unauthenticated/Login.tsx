import * as React from "react";
import { Action } from 'redux'

import { Splash } from "../Splash";

import { createLoginAction, createNavigateToAction, createSetAuthErrorMessageAction } from '../../redux/actions';
import { User } from '../Users';

import { post } from '../../util/network';

import { Form, FormGroup, FormControl, ControlLabel, Button, Alert } from "react-bootstrap"

import { LoginResponse } from '../../../common/messages';

interface loginProps {
    dispatch: (a: Action) => void,
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
        post('/api/auth/login', { username: this.state.username, password: this.state.password })
            .then((res: LoginResponse) => {
                console.log('auth succeeded');
                let u = new User()
                    .set('uuid', res.uuid)
                    .set('name', res.username)
                    .set('godLevel', res.accessLevel)
                    .set('email', res.email)
                this.props.dispatch(createLoginAction(u));
                if(window.location.pathname == "" || window.location.pathname == "/")
                    this.props.dispatch(createNavigateToAction('/account'));
            }).catch((err: Error) => {
                console.log('auth failed');
                this.props.dispatch(createSetAuthErrorMessageAction(err.message));
            })
    }

    render() {
        let errorMsg = <div></div>
        if (this.props.errorMsg) {
            errorMsg = <Alert bsStyle="danger">{this.props.errorMsg}</Alert>
        }
        return (
            <div>
                <Form inline={true} onSubmit={this.handleLogin.bind(this)}>
                    <FormGroup>
                        <ControlLabel>Username: </ControlLabel>
                        <FormControl placeholder="username" onChange={this.onUsername.bind(this)} />
                        <ControlLabel>Password: </ControlLabel>
                        <FormControl type="password" placeholder="password" onChange={this.onPassword.bind(this)} />
                        <Button type="submit">Login</Button>
                        {errorMsg}
                    </FormGroup>
                </Form>
                <Splash />
            </div>
        )
    }
}