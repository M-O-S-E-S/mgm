import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { Host, HostStat } from '.';
import { Region } from '../Regions';

import { Grid, Row, Col, Button } from 'react-bootstrap';

import { HostView } from './HostView';
import { HostAddModal } from './HostAdd';

interface props {
    dispatch: (a: Action) => void,
    hosts: Map<number, Host>
    hostStats: Map<number, HostStat>
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
        return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState) ;
    }

    showAddHost() {
        this.setState({
            showAdd: true
        })
    }

    onNewHost(address: string) {
        //RequestCreateHost(address);
        alertify.error('not implemented');
        this.setState({
            showAdd: false
        })
    }
    cancelNewHost() {
        this.setState({
            showAdd: false
        })
    }


    render() {
        let hosts = this.props.hosts.toList().map((h: Host) => {
            return <HostView key={h.id} host={h} regions={this.props.regions} dispatch={this.props.dispatch} />
        });
        let addHost = <span />
        if (this.state.showAdd) {
            addHost = <HostAddModal
                cancel={this.cancelNewHost.bind(this)}
                submit={this.onNewHost.bind(this)} />;
        }


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
                {addHost}
            </Grid >
        );
    }
}