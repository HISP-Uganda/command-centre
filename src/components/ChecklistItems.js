import React from 'react';
import { inject, observer } from "mobx-react";


const Table = () => {
    return <table id="customers">
        <thead>
            <tr>
                <th>Checklist Item</th>
                <th>Yes</th>
                <th>No</th>
                <th>Quality Score</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Alfreds Futterkiste</td>
                <td>Maria Anders</td>
                <td>Germany</td>
                <td>Germany</td>
            </tr>

        </tbody>
    </table>
}

@inject('store')
@observer
class ColdChain extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div style={{ padding: 20 }}>
            <Table />
        </div>
    }

}

@inject('store')
@observer
class SuppliesDistribution extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div>
            Supply distribution
        </div>
    }

}

@inject('store')
@observer
class AdequateSupplies extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div>
            AdequateSupplies
        </div>
    }

}


@inject('store')
@observer
class PostArrangements extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div>
            PostArrangements
        </div>
    }

}

@inject('store')
@observer
class MonitoringAEFI extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div>
            MonitoringAEFI
        </div>
    }

}

@inject('store')
@observer
class MonitoringCoverage extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div>
            MonitoringCoverage
        </div>
    }

}

@inject('store')
@observer
class Practice extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div>
            Supply distribution
        </div>
    }

}

@inject('store')
@observer
class WasteManagement extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div>
            WasteManagement
        </div>
    }

}

@inject('store')
@observer
class SocialMobilization extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {

    }


    render() {
        return <div>
            SocialMobilization
        </div>
    }

}


export {
    ColdChain,
    SuppliesDistribution,
    SocialMobilization,
    AdequateSupplies,
    WasteManagement,
    Practice,
    MonitoringCoverage,
    MonitoringAEFI,
    PostArrangements

}
