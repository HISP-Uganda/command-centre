import React from 'react'
import { inject, observer } from "mobx-react";
import { Form4 } from './displays';
import { isEmpty } from 'lodash'

@inject('store')
@observer
class MR4Dashboard extends React.Component {
    store = null;
    chart;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    async componentDidMount() {
        await this.store.fetchForm4();
        this.chart = this.store.form4MR.gauge;
    }
    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    render() {
        const { d2 } = this.props;
        return (

            <div>
                {!isEmpty(this.store.form4MR.childrenTargets) ? <Form4
                    d2={d2}
                    disease={"MR (RUBELLA)"}
                    location={this.store.selected.length > 0 ? this.store.selected[0].displayName : ''}
                    map={this.store.form4MR.disaggregatedMap}
                    vials={this.store.form4MR.textValues.dosesIssued}
                    used={this.store.form4MR.textValues.dosesUsed}
                    vaccinated={this.store.form4MR.textValues.vaccinated.toLocaleString()}
                    vaccinatedGraphData={this.store.form4MR.vaccinated}
                    target={this.store.form4MR.textValues.ubosTarget}
                    coverage={this.store.form4MR.textValues.ubosCoverage}
                    wastageGraphData={this.store.form4MR.discarded}
                    wastage={this.store.form4MR.textValues.wastage}
                    workers={this.store.form4MR.textValues.healthWorkers}
                    workload={this.store.form4MR.textValues.workload}
                    disaggregatedGraphData={this.store.form4MR.disaggregatedData}
                    disaggregatedWastageGraphData={this.store.form4MR.disaggregatedWastage}
                    onOrgUnitSelect={this.store.onOrgUnitSelect1}
                    discarded={this.store.form4MR.textValues.dosesDiscarded}
                    wastageSummary={this.store.form4MR.wastageGraph}
                /> : <div>Loading...</div>}
            </div>

        )
    }
}
export default MR4Dashboard
