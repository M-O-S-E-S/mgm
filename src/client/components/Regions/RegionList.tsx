import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { RegionView } from './RegionView';
import { Estate } from '../Estates';
import { Host } from '../Hosts';
import { Region, RegionStat } from '.';

import { ManageModal } from './Manage';
import { ContentModal } from './Content';
import { LogModal } from './Log';

import { Grid, Row, Col, Button, FormControl } from 'react-bootstrap';

interface props {
    dispatch: (a: Action) => void,
    regions: Map<string, Region>,
    estateMap: Map<string, number>,
    estates: Map<number, Estate>,
    hosts: Map<number, Host>
}

interface state {
    showManage: boolean
    showContent: boolean
    showLog: boolean
    selectedRegion: Region
    regionSearch: string
    estateSearch: string
}

export class RegionList extends React.Component<props, {}> {
    state: state

    constructor(p: props) {
        super(p);
        this.state = {
            showManage: false,
            showContent: false,
            showLog: false,
            selectedRegion: null,
            regionSearch: '',
            estateSearch: ''
        }
    }

    shouldComponentUpdate(nextProps: props, nextState: state) {
        return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState);
    }

    onSearch(e: { target: { value: string } }) {
        this.setState({
            regionSearch: e.target.value
        })
    }

    onEstate(e: { target: { value: string } }) {
        this.setState({
            estateSearch: e.target.value
        })
    }

    onManageRegion(r: Region) {
        this.setState({
            showManage: true,
            showContent: false,
            selectedRegion: r
        })
    }

    dismissManage() {
        this.setState({
            showManage: false
        })
    }

    onManageRegionContent(r: Region) {
        this.setState({
            showManage: false,
            showContent: true,
            selectedRegion: r
        })
    }

    dismissManageContent() {
        this.setState({
            showContent: false
        })
    }

    onDisplayLog(r: Region) {
        this.setState({
            showLog: true,
            selectedRegion: r
        })
    }

    disMissLog() {
        this.setState({
            showLog: false,
        })
    }

    render() {
        let estates = this.props.estates.toArray()
            .filter((e: Estate) => { 
                return this.state.estateSearch === '' || e.name === this.state.estateSearch;
            })
            .sort((a: Estate, b: Estate) => { return a.name.localeCompare(b.name) })
            .map((e: Estate) => {
                let regions = this.props.regions.toArray()
                    // we only want regions for the current estate
                    .filter((r: Region) => {
                        let estateId: number = this.props.estateMap.get(r.uuid);
                        return estateId === e.id;
                    }, [])
                    // we only want regions that match the current text search
                    .filter((r: Region) => {
                        return r.name.toLowerCase().indexOf(this.state.regionSearch.toLowerCase()) !== -1;
                    }, [])
                    // sort remaining regions by name
                    .sort((a: Region, b: Region) => { return a.name.localeCompare(b.name) })
                    //convert Region class instances to JSX
                    .map((r: Region) => {
                        return <RegionView
                            key={r.uuid}
                            region={r}
                            onManage={this.onManageRegion.bind(this, r)}
                            onContent={this.onManageRegionContent.bind(this, r)}
                            onLog={this.onDisplayLog.bind(this, r)} />
                    })
                if (regions.length > 0) {
                    return (
                        <div key={e.id}>
                            <h1>{e.name}</h1>
                            {regions}
                        </div>
                    )
                } else {
                    return null;
                }
            });

        let estateSelect = this.props.estates.toList().sort((a, b) => {
            return a.name.localeCompare(b.name);
        }).map((e: Estate) => {
            return <option key={e.id} value={e.name}>{e.name}</option>
        });

        return (
            <Grid>
                <Row>
                    <Col md={2}><h3>Filter by:</h3></Col>
                    <Col md={4}>Region Name <FormControl type="search" onChange={this.onSearch.bind(this)} /></Col>
                    <Col md={4}>Estate
                        <FormControl componentClass="select" placeholder="" onChange={this.onEstate.bind(this)}>
                            <option value=''>all</option>
                            {estateSelect}
                        </FormControl>
                    </Col>
                    <Col md={2}><h3><Button>Add Region</Button></h3></Col>
                </Row>
                {estates}
                {this.state.showManage ? <ManageModal
                    dismiss={this.dismissManage.bind(this)}
                    region={this.state.selectedRegion}
                    estates={this.props.estates}
                    estateMap={this.props.estateMap}
                    hosts={this.props.hosts} /> : <span />}
                {this.state.showContent ? <ContentModal dismiss={this.dismissManageContent.bind(this)} region={this.state.selectedRegion} /> : <span />}
                {this.state.showLog ? <LogModal dismiss={this.disMissLog.bind(this)} region={this.state.selectedRegion} /> : <span />}
            </Grid>
        )
    }
}