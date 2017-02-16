import * as React from "react";
import { Action } from "redux"

import { ReduxStore } from '../Redux';

import { Navbar, Nav, NavItem } from 'react-bootstrap';

import { Register } from "./unauthenticated/Register";
import { Password } from "./unauthenticated/Password";
import { Login } from "./unauthenticated/Login";
import { Footer } from './Footer';

interface unauthenticatedProps {
    store: ReduxStore,
    route: string,
    errorMsg: string
}

export class Unauthenticated extends React.Component<unauthenticatedProps, {}> {

    handleNav(href: string) {
        this.props.store.NavigateTo(href);
    }

    render() {
        let navbar = (
            <Navbar>
                <Navbar.Header>
                    <Navbar.Toggle />
                    <Navbar.Brand>MGM</Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem
                            active={this.props.route === "/login" || this.props.route === "/"}
                            onClick={this.handleNav.bind(this, "/login") }>
                            Log In
                        </NavItem>
                        <NavItem
                            active={this.props.route === "/password"}
                            onClick={this.handleNav.bind(this, "/password") }>
                            Recover Password
                        </NavItem>
                        <NavItem
                            active={this.props.route === "/register"}
                            onClick={this.handleNav.bind(this, "/register") }>Register
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
        switch (this.props.route) {
            case '/password':
                return (
                    <div>
                        {navbar}
                        <Password />
                        <Footer />
                    </div>
                )
            case '/register':
                return (
                    <div>
                        {navbar}
                        <Register />
                        <Footer />
                    </div>
                )
            default:
                return (
                    <div>
                        {navbar}
                        <Login store={this.props.store} errorMsg={this.props.errorMsg}/>
                        <Footer />
                    </div>
                )
        }
    }
}
