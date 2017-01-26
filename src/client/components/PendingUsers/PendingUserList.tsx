import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { PendingUser } from '.';
import { PendingUserView } from './PendingUserView';
import { ReviewPendingModal } from './ReviewPendingModal';

import { Grid, Row, Col } from 'react-bootstrap';

interface props {
    dispatch: (a: Action) => void,
    users: Map<string, PendingUser>
}

interface state {
    showReview?: boolean
    selectedUser?: PendingUser
}

export class PendingUserList extends React.Component<props, state> {

    constructor(props: props){
        super(props);
        this.state = {
            showReview: false,
            selectedUser: null
        }
    }

    shouldComponentUpdate(nextProps: props, nextState: state) {
        return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState);
    }

    onShowReview(u: PendingUser) {
        this.setState({
            showReview: true,
            selectedUser: u
        });
    }
    onDismissReview() {
        this.setState({
            showReview: false
        });
    }

    render() {
        let users = this.props.users.toList().map((u: PendingUser) => {
            return <PendingUserView key={u.name} user={u} onReview={this.onShowReview.bind(this, u)}/>
        })

        return (
            <Grid>
                <Row>
                    <Col md={3}>Name</Col>
                    <Col md={3}>Email</Col>
                    <Col md={3}>Registered</Col>
                    <Col md={3}></Col>
                </Row>
                {users}
                <ReviewPendingModal
                    show={this.state.showReview} 
                    cancel={this.onDismissReview.bind(this)} 
                    dispatch={this.props.dispatch.bind(this)}
                    user={this.state.selectedUser} />
            </Grid>
        )
    }
}