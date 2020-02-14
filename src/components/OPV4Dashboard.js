import React from 'react'
import { inject, observer } from "mobx-react";
import { Form4 } from './displays';
import { isEmpty } from 'lodash'

@inject('store')
@observer
class OPV4Dashboard extends React.Component {
    store = null;
    chart;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    async componentDidMount() {
        await this.store.fetchForm4OPV();
        this.chart = this.store.form4OPV.gauge;
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
                {!isEmpty(this.store.form4OPV.childrenTargets) ? <Form4
                    d2={d2}
                    disease={"OPV (POLIO)"}
                    location={this.store.selected.length > 0 ? this.store.selected[0].displayName : ''}
                    map={this.store.form4OPV.disaggregatedMap}
                    vials={this.store.form4OPV.textValues.dosesIssued}
                    used={this.store.form4OPV.textValues.dosesUsed}
                    vaccinated={this.store.form4OPV.textValues.vaccinated.toLocaleString()}
                    vaccinatedGraphData={this.store.form4OPV.vaccinated}
                    target={this.store.form4OPV.textValues.ubosTarget}
                    coverage={this.store.form4OPV.textValues.ubosCoverage}
                    wastageGraphData={this.store.form4OPV.discarded}
                    wastage={this.store.form4OPV.textValues.wastage}
                    workers={this.store.form4OPV.textValues.healthWorkers}
                    workload={this.store.form4OPV.textValues.workload}
                    disaggregatedGraphData={this.store.form4OPV.disaggregatedData}
                    disaggregatedWastageGraphData={this.store.form4OPV.disaggregatedWastage}
                    onOrgUnitSelect={this.store.onOrgUnitSelect1}
                    discarded={this.store.form4OPV.textValues.dosesDiscarded}
                    wastageSummary={this.store.form4OPV.wastageGraph}
                /> : <div>Loading</div>}
            </div>

        )
    }
}
export default OPV4Dashboard
