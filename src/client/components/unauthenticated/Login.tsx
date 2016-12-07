import * as React from "react";
import { Action } from 'redux'

import { Splash } from "../Splash";

import { createLoginAction } from '../../redux/actions';
import { User } from '../Users';

import { Form, FormGroup, FormControl, ControlLabel, Button, Alert } from "react-bootstrap"

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
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/auth/login');
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        xhr.onload = () => {
            if (xhr.status !== 200) {
                console.log('Request failed.  Returned status of ' + xhr.status);
                this.setState({
                    msg: "Login failed, cannot contact MGM"
                })
            } else {
                let res = JSON.parse(xhr.response);
                if (res.Success) {
                    console.log('auth succeeded');
                    let u = new User()
                        .set('uuid', res.uuid)
                        .set('name', res.username)
                        .set('godLevel', res.accessLevel)
                        .set('email', res.email)
                    this.props.dispatch(createLoginAction(u));
                } else {
                    console.log('auth failed');
                    this.setState({
                        msg: res.Message
                    })
                }
            }
        };
        xhr.send('username=' + this.state.username + '&password=' + this.state.password);

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