import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { Host, Region } from '../../Immutable';
import { ReduxStore } from '../../Redux';
import { Grid, Row, Col, Button } from 'react-bootstrap';

import { HostView } from './HostView';
import { AddHostModal } from './AddHostModal';

interface props {
    store: ReduxStore,
    hosts: Map<number, Host>
    regions: Map<string, Region>
}

interface state {
    showAdd: boolean
}

export class HostList extends React.Component<props, {}> {
    state: state
    constructor(props: props) {
        super(props);
        this.state = {
            showAdd: false
        }
    }

    shouldComponentUpdate(nextProps: props, nextState: state) {
        return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState);
    }

    showAddHost() {
        this.setState({
            showAdd: true
        })
    }
    cancelNewHost() {
        this.setState({
            showAdd: false
        })
    }


    render() {
        let hosts = this.props.hosts.toList().map((h: Host) => {
            return <HostView key={h.id} host={h} regions={this.props.regions} store={this.props.store} />
        });

        return (
            <Grid>
                <h1>Hosts</h1>
                <Row>
                    <Col md={2}>Name</Col>
                    <Col md={1}>Address</Col>
                    <Col md={1}>Regions</Col>
                    <Col md={7}>Performance</Col>
                    <Col md={1}><Button onClick={this.showAddHost.bind(this)}>Add Host</Button></Col>
                </Row>
                {hosts}
                <AddHostModal
                    show={this.state.showAdd}
                    cancel={this.cancelNewHost.bind(this)}
                    store={this.props.store} />
            </Grid >
        );
    }
}