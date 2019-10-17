import React from 'react';
import { inject, observer } from "mobx-react";
import { Router, Link } from "@reach/router";
import { ColdChain, SuppliesDistribution, AdequateSupplies, PostArrangements, MonitoringAEFI, Practice, WasteManagement, SocialMobilization, MonitoringCoverage } from './ChecklistItems';
@inject('store')
@observer
class CheckList extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
        this.store.setActive('2')
    }

    componentDidMount() {

    }

    render() {
        return <div style={{ display: 'flex', height: '100%', padding: 5 }}>

            <div className="content" style={{ width: '20%', margin: 5 }}>
                <div
                    className="headers"
                    style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
                >
                    <div style={{ fontSize: 20, textAlign: 'center' }}>SUPERVISION CHECKLIST {this.store.selected.length > 0 ? this.store.selected[0].displayName : ''}
                    </div>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', paddingBottom: 10 }}>
                    <Link className="checklist" to="./">COLD CHAINS</Link>
                    <Link className="checklist" to="supplies-distribution">SUPPLIES DISTRIBUTION</Link>
                    <Link className="checklist" to="adequate-supplies">ADEQUATE SUPPLIES</Link>
                    <Link className="checklist" to="post-arrangements">POST ARRANGEMENTS</Link>
                    <Link className="checklist" to="monitoring-aefi">MONITORING AEFI</Link>
                    <Link className="checklist" to="practice">PRACTICE AND SAFETY</Link>
                    <Link className="checklist" to="wastage-management">WASTAGE MANAGEMENT</Link>
                    <Link className="checklist" to="social-mobilization">SOCIAL MOBILIZATION</Link>
                    <Link className="checklist" to="monitoring-coverage">MONITORING COVERAGE</Link>
                </nav>
            </div>
            <div style={{ margin: 5, width: '80%' }} className="content">
                <div
                    className="headers"
                    style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
                >
                    <div style={{ fontSize: 20, textAlign: 'center' }}>ADEQUACY OF SUPPLIES AND COMMODITIES - {this.store.selected.length > 0 ? this.store.selected[0].displayName : ''}
                    </div>
                </div>
                <Router>
                    <ColdChain path="/" />
                    <SuppliesDistribution path="/supplies-distribution" />
                    <AdequateSupplies path="/adequate-supplies" />
                    <PostArrangements path="/post-arrangements" />
                    <MonitoringAEFI path="/monitoring-aefi" />
                    <Practice path="/practice" />
                    <WasteManagement path="/wastage-management" />
                    <SocialMobilization path="/social-mobilization" />
                    <MonitoringCoverage path="/monitoring-coverage" />
                </Router>
            </div>

        </div>
    }

}

export default CheckList
