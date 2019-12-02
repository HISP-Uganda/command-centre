import React from 'react'
import { inject, observer } from "mobx-react";
import { Form2 } from './displays';

@inject('store')
@observer
class OPVDashboard extends React.Component {
    store = null;
    chart;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {
        this.store.fetchRoot();
        this.chart = this.store.MR.opvGauge;
    }
    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    render() {
        const { d2 } = this.props;
        return (
            <Form2
                d2={d2}
                disease={"OPV (POLIO)"}
                location={this.store.selected.length > 0 ? this.store.selected[0].displayName : ''}
                map={this.store.MR.map}
                vials={this.store.MR.opvTextValues.no_vaccine_vials_issued ? Number(this.store.MR.opvTextValues.no_vaccine_vials_issued * 10).toLocaleString() : 0}
                used={this.store.MR.opvTextValues.used ? Number(this.store.MR.opvTextValues.used).toLocaleString() : 0}
                vaccinated={Number(this.store.MR.opvTextValues.children_vaccinated).toLocaleString()}
                vaccinatedGraphData={this.store.MR.vaccinatedOPV}
                target={Number(this.store.MR.currentMRTarget).toLocaleString()}
                coverage={this.store.MR.opvEstimates}
                wastageGraphData={this.store.MR.discarded}
                wastage={this.store.MR.opvTextValues.wastage ? Number((this.store.MR.opvTextValues.wastage * 100).toFixed(1)) : 0}
                workers={Number(this.store.MR.opvTextValues.number_health_workers).toLocaleString()}
                workload={this.store.MR.opvTextValues.workload}
                disaggregatedGraphData={this.store.MR.disaggregatedOPV}
                disaggregatedWastageGraphData={this.store.MR.disaggregatedWastageOPV}
                onOrgUnitSelect={this.store.onOrgUnitSelect}
                discarded={Number(20 * this.store.MR.opvTextValues.no_vials_discarded).toLocaleString()}
                wastageSummary={this.store.MR.wastageGraph}
                totalPosts={Number(this.store.MR.posts).toLocaleString()}
                postsReporting={Number(this.store.MR.opvTextValues.posts).toLocaleString()}
                reportingRates={this.store.MR.posts === 0 ? 0 : Number((100 * this.store.MR.opvTextValues.posts / this.store.MR.posts).toFixed(1))}
            />
        )
    }
}
export default OPVDashboard
