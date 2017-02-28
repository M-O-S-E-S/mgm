import * as React from "react";
import { Action } from 'redux';
import { Map } from 'immutable';
const shallowequal = require('shallowequal');

import { RegionView } from './RegionView';
import { Estate, Host, Region } from '../../Immutable';

import { ManageModal } from './ManageModal';
import { ContentModal } from './ContentModal';
import { LogModal } from './LogModal';
import { AddRegionModal } from './AddRegionModal';

import { ReduxStore, StateModel } from '../../Redux';

import { Grid, Row, Col, Button, FormControl, Well } from 'react-bootstrap';

interface props {
    store: ReduxStore,
    regions: Map<string, Region>,
    estateMap: Map<string, number>,
    estates: Map<number, Estate>,
    hosts: Map<number, Host>,
    isAdmin: boolean
}

interface state {
    showManage?: boolean
    showContent?: boolean
    showLog?: boolean
    showAddRegion?: boolean
    selectedRegion?: Region
    regionSearch?: string
    estateSearch?: string
    stateSearch?: string
}

export class RegionList extends React.Component<props, state> {
    constructor(p: props) {
        super(p);
        this.state = {
            showManage: false,
            showContent: false,
            showLog: false,
            showAddRegion: false,
            selectedRegion: null,
            regionSearch: '',
            estateSearch: '',
            stateSearch: 'all'
        }
    }

    componentWillReceiveProps(nextProps: props) {
        if (this.state.selectedRegion) {
            this.setState({
                selectedRegion: nextProps.regions.get(this.state.selectedRegion.uuid, null)
            })
        }
    }

    shouldComponentUpdate(nextProps: props, nextState: state) {
        return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState);
    }

    // Search and Filter
    onSearchChange(e: { target: { value: string } }) {
        this.setState({
            regionSearch: e.target.value
        });
    }
    onEstateChange(e: { target: { value: string } }) {
        this.setState({
            estateSearch: e.target.value
        });
    }
    onSearchStatus(e: { target: { value: string } }) {
        console.log(e.target.value)
        this.setState({
            stateSearch: e.target.value
        });
    }

    onManageRegion(r: Region) {
        this.setState({
            showManage: true,
            showContent: false,
            selectedRegion: r
        });
    }
    dismissManage() {
        this.setState({
            showManage: false
        });
    }

    onManageRegionContent(r: Region) {
        this.setState({
            showManage: false,
            showContent: true,
            selectedRegion: r
        });
    }
    dismissManageContent() {
        this.setState({
            showContent: false
        });
    }

    onDisplayLog(r: Region) {
        this.setState({
            showLog: true,
            selectedRegion: r
        });
    }
    disMissLog() {
        this.setState({
            showLog: false,
        });
    }

    onAddRegion() {
        this.setState({
            showAddRegion: true
        });
    }
    dismissAddRegion() {
        this.setState({
            showAddRegion: false
        })
    }

    render() {
        // construct estate tree and region lists while filtering by estate and region name
        let estates = this.props.estates.toArray()
            .filter((e: Estate) => {
                return this.state.estateSearch === '' || e.EstateName === this.state.estateSearch;
            })
            .sort((a: Estate, b: Estate) => { return a.EstateName.localeCompare(b.EstateName) })
            .map((e: Estate) => {
                let regions = this.props.regions.toArray()
                    // we only want regions for the current estate
                    .filter((r: Region) => {
                        let estateId: number = this.props.estateMap.get(r.uuid);
                        return estateId === e.EstateID;
                    }, [])
                    // we only want regions that match the current text search
                    .filter((r: Region) => {
                        return r.name.toLowerCase().indexOf(this.state.regionSearch.toLowerCase()) !== -1;
                    }, [])
                    // we only want regions with the selected status
                    .filter((r: Region) => {
                        if (this.state.stateSearch === 'all')
                            return true;
                        if (this.state.stateSearch === 'running')
                            return r.isRunning;
                        if (this.state.stateSearch === 'stopped')
                            return ! r.isRunning;
                    }, [])
                    // sort remaining regions by name
                    .sort((a: Region, b: Region) => { return a.name.localeCompare(b.name) })
                    //convert Region class instances to JSX
                    .map((r: Region) => {
                        return <RegionView
                            key={r.uuid}
                            isAdmin={this.props.isAdmin}
                            region={r}
                            onManage={this.onManageRegion.bind(this, r)}
                            onContent={this.onManageRegionContent.bind(this, r)}
                            onLog={this.onDisplayLog.bind(this, r)} />
                    })
                if (regions.length > 0) {
                    return (
                        <div key={e.EstateID}>
                            <h1>{e.EstateName}</h1>
                            {regions}
                        </div>
                    )
                } else {
                    return null;
                }
            });

        let estateSelect = this.props.estates.toList().sort((a, b) => {
            return a.EstateName.localeCompare(b.EstateName);
        }).map((e: Estate) => {
            return <option key={e.EstateID} value={e.EstateName}>{e.EstateName}</option>
        });

        return (
            <Grid>
                <Row>
                    <Col md={10}>
                        <Well>
                            <Row>
                                <Col md={2}><h3>Filter:</h3></Col>
                                <Col md={2}>Running
                                    <FormControl componentClass="select" placeholder="" onChange={this.onSearchStatus.bind(this)}>
                                        <option value='all'>all</option>
                                        <option value='running'>running</option>
                                        <option value='stopped'>stopped</option>
                                    </FormControl>
                                </Col>
                                <Col md={4}>Region Name <FormControl type="search" onChange={this.onSearchChange.bind(this)} /></Col>
                                <Col md={4}>Estate
                                    <FormControl componentClass="select" placeholder="" onChange={this.onEstateChange.bind(this)}>
                                        <option value=''>all</option>
                                        {estateSelect}
                                    </FormControl>
                                </Col>
                            </Row>
                        </Well>
                    </Col>
                    <Col md={2}>
                        {this.props.isAdmin ?
                            <h3><Button onClick={this.onAddRegion.bind(this)}>Add Region</Button></h3> :
                            <span />
                        }
                    </Col>
                </Row>
                {estates}
                <ManageModal
                    show={this.state.showManage}
                    dismiss={this.dismissManage.bind(this)}
                    store={this.props.store}
                    region={this.state.selectedRegion}
                    estates={this.props.estates}
                    estateMap={this.props.estateMap}
                    hosts={this.props.hosts}
                    regions={this.props.regions} />
                <ContentModal
                    show={this.state.showContent}
                    dismiss={this.dismissManageContent.bind(this)}
                    region={this.state.selectedRegion}
                    store={this.props.store} />
                <LogModal show={this.state.showLog} dismiss={this.disMissLog.bind(this)} region={this.state.selectedRegion} />
                <AddRegionModal
                    show={this.state.showAddRegion}
                    dismiss={this.dismissAddRegion.bind(this)}
                    store={this.props.store}
                    estates={this.props.estates}
                    regions={this.props.regions} />
            </Grid>
        )
    }
}