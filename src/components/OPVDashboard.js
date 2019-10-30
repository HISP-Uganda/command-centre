import React from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Tabs, Progress, Table } from 'antd';
import OuTreeDialog from './dialogs/OuTreeDialog';
import { inject, observer } from "mobx-react";
import Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official';
import gauge from 'highcharts/modules/solid-gauge';
import data from 'highcharts/modules/data';
import maps from 'highcharts/modules/map';
import exporting from 'highcharts/modules/exporting';
import fullScreen from 'highcharts/modules/full-screen'
import MapChart from './Map';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

HC_more(Highcharts);
gauge(Highcharts);
data(Highcharts);
maps(Highcharts);
exporting(Highcharts);
fullScreen(Highcharts)
const { TabPane } = Tabs;

const columns = [
    {
        title: 'Organisation',
        dataIndex: 'ou',
        key: 'ou',
        width: 100,
        fixed: 'left'
    },
    {
        title: 'Day',
        dataIndex: 'day',
        width: 200,
        key: 'day',
    }
    , {
        title: 'Targe Population',
        dataIndex: 'target',
        width: 200,
        key: 'target_population',
    }, {
        title: 'No. Posts',
        dataIndex: 'posts.value',
        key: 'posts',
    }, {
        title: 'Health Workers',
        width: 200,
        dataIndex: 'number_health_workers.value',
        key: 'workers',
    },
    {
        title: 'Mobilizers',
        dataIndex: 'number_mobilizers.value',
        width: 200,
        key: 'mobilizers',
    }, {
        title: 'Vaccine Issued',
        dataIndex: 'no_vaccine_vials_issued.value',
        width: 200,
        key: 'issued',
    }, {
        title: 'Vaccinated',
        dataIndex: 'children_vaccinated.value',
        width: 200,
        key: 'children_vaccinated',
    }, {
        title: 'Discarded (contamination)',
        dataIndex: 'no_vials_discarded_due_contamination.value',
        width: 200,
        key: 'contamination',
    }, {
        title: 'Discarded (vvm color change)',
        dataIndex: 'no_vials_discarded_due_vvm_color_change.value',
        width: 200,
        key: 'color',
    }, {
        title: 'Discarded (partial use)',
        dataIndex: 'no_vials_discarded_due_partial_use.value',
        width: 200,
        key: 'partial',
    },
    {
        title: 'Discarded (other factors)',
        dataIndex: 'no_vials_discarded_other_factors.value',
        width: 200,
        key: 'other',
    },
    {
        title: 'Discarded (total)',
        dataIndex: 'no_vials_discarded.value',
        width: 200,
        key: 'total',
    },
    {
        title: 'Returned',
        dataIndex: 'no_vaccine_vials_returned_unopened.value',
        width: 100,
        key: 'returned',
    },
    {
        title: 'Wastage',
        dataIndex: 'wastage',
        width: 100,
        key: 'wastage',
    },
    {
        title: 'Workload',
        dataIndex: 'workload',
        width: 100,
        key: 'workload',
    },
    {
        title: 'Coverage',
        key: 'coverage',
        width: 100,
        dataIndex: 'coverage'
    }
];



const ResponsiveGridLayout = WidthProvider(Responsive);

@inject('store')
@observer
class OPVDashboard extends React.Component {
    store = null;
    chart
    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
        this.store.setActive('1')
    }

    callback = (key) => {
        console.log(key);
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
        const layouts = {
            lg: [
                { "w": 9, "h": 1, "x": 0, "y": 0, "i": "a", "moved": false, "static": false },
                { "w": 3, "h": 1, "x": 9, "y": 0, "i": "b", "moved": false, "static": false },
                { "w": 6, "h": 2, "x": 0, "y": 1, "i": "d", "moved": false, "static": false },
                { "w": 6, "h": 2, "x": 0, "y": 3, "i": "m", "moved": false, "static": false },
                { "w": 3, "h": 4, "x": 6, "y": 1, "i": "e", "moved": false, "static": false },
                { "w": 6, "h": 9, "x": 0, "y": 5, "i": "f", "moved": false, "static": false },
                { "w": 12, "h": 11, "x": 0, "y": 14, "i": "n", "moved": false, "static": false },
                { "w": 12, "h": 11, "x": 0, "y": 25, "i": "o", "moved": false, "static": false },
                { "w": 3, "h": 9, "x": 6, "y": 5, "i": "g", "moved": false, "static": false },
                { "w": 3, "h": 2, "x": 9, "y": 1, "i": "h", "moved": false, "static": false },
                { "w": 3, "h": 2, "x": 9, "y": 3, "i": "i", "moved": false, "static": false },
                { "w": 3, "h": 5, "x": 9, "y": 5, "i": "j", "moved": false, "static": false },
                { "w": 3, "h": 2, "x": 9, "y": 10, "i": "k", "moved": false, "static": false },
                { "w": 3, "h": 2, "x": 9, "y": 12, "i": "l", "moved": false, "static": false }
            ],
            xxl: [
                { i: 'a', x: 0, y: 0, w: 9, h: 1 },
                { i: 'b', x: 10, y: 0, w: 3, h: 1 },
                { i: 'c', x: 0, y: 1, w: 6, h: 3 },
                { i: 'd', x: 0, y: 2, w: 6, h: 1 },
                { i: 'e', x: 6, y: 2, w: 3, h: 4 },
                { i: 'f', x: 0, y: 2, w: 6, h: 9 },
                { i: 'g', x: 6, y: 2, w: 3, h: 9 },
                { i: 'h', x: 10, y: 1, w: 3, h: 2 },
                { i: 'i', x: 10, y: 2, w: 3, h: 2 },
                { i: 'j', x: 10, y: 3, w: 3, h: 5 },
                { i: 'k', x: 10, y: 4, w: 3, h: 2 },
                { i: 'l', x: 10, y: 5, w: 3, h: 2 }
            ]
        }
        return (
            <ResponsiveGridLayout className="layout" layouts={layouts}
                breakpoints={{ xxl: 3400, lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ xxl: 12, lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                rowHeight={56}
                onLayoutChange={(layout) => console.log(JSON.stringify(layout))}
            >
                <div key="a" style={{ background: 'white' }}>
                    <div
                        className="headers"
                        style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
                    >
                        <div style={{ fontSize: 20, textAlign: 'center' }}>POLIO (OPV) - {this.store.selected.length > 0 ? this.store.selected[0].displayName : ''}</div>
                        <OuTreeDialog d2={d2} />
                    </div>
                </div>

                <div key="b" style={{ background: 'white' }}>
                    <div
                        style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
                    >
                        <div key="1" style={{ fontSize: 20, textAlign: 'center' }}>STOCK AND WASTAGE SUMMARY</div>
                    </div>
                </div>
                <div key="d" style={{ background: 'white' }} className="flex-center">
                    <div className="container" style={{ width: "20%" }}>
                        <div style={{
                            color: '#000066'
                        }}>TOTAL NO. OF POSTS</div>
                        <div className="red">{this.store.MR.posts}</div>
                    </div>

                    <div className="container" style={{ width: "20%" }}>
                        <div style={{
                            color: '#000066'
                        }}>NO. OF POSTS REPORTING </div>
                        <div className="red">{this.store.MR.opvTextValues.posts}</div>
                    </div>

                    <div className="container" style={{ width: "20%" }}>
                        <div style={{
                            color: '#000066'
                        }}>REPORTING RATES </div>
                        <div className="red">{this.store.MR.posts === 0 ? 0 : (100 * this.store.MR.opvTextValues.posts / this.store.MR.posts).toFixed(1)}%</div>
                    </div>
                    <div className="container" style={{ width: "20%" }}>
                        <div style={{ color: '#000066' }}>CHILDREN VACCINATED</div>
                        <div className="green">{this.store.MR.opvTextValues.children_vaccinated}</div>
                    </div>

                    <Progress strokeWidth={15} showInfo={false} type="circle" percent={this.store.MR.posts === 0 ? 0 : (100 * this.store.MR.opvTextValues.posts / this.store.MR.posts)} width={80} style={{ width: '20%', textAlign: "center" }} />
                </div>

                <div key="m" style={{ background: 'white' }} className="flex-center">
                    <div className="container" style={{ width: "2o%" }}>
                        <div style={{ color: '#000066' }}>POPULATION TARGET (UBOS 2019)</div>
                        <div className="red">{this.store.MR.currentMRTarget}</div>
                    </div>

                    <div className="container" style={{ width: "20%" }}>
                        <div style={{ color: '#000066' }}>POPULATION TARGET (DISTRICT)</div>
                        <div className="red">{this.store.MR.opvTextValues.target_population}</div>
                    </div>

                    <div className="container" style={{ width: "20%" }}>
                        <div style={{ color: '#000066' }}>OPV COVERAGE (DISTRICT)</div>
                        <div className="green">{this.store.MR.opvTextValues.covarage}%</div>
                    </div>

                    <div className="container" style={{ width: "20%" }}>
                        <div style={{ color: '#000066' }}>OPV COVERAGE (UBOS)</div>
                        <div className="green">{this.store.MR.opvEstimates}%</div>
                    </div>
                    <Progress strokeWidth={15} showInfo={false} type="circle" percent={isNaN(this.store.MR.opvEstimates) ? 0 : this.store.MR.opvEstimates} width={80} style={{ width: '20%', textAlign: "center" }} />
                </div>
                <div key="e" style={{ background: 'white' }}>
                    <div id="chartdiv" style={{ width: "100%", height: "250px" }}></div>
                </div>
                <div key="f" style={{ background: 'white' }}>
                    <Tabs defaultActiveKey="1" onChange={this.callback}>
                        <TabPane tab="Performance(Daily)" key="1">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.store.MR.vaccinatedOPV}
                            />
                        </TabPane>
                        <TabPane tab="Performance(Sub-level)" key="2">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.store.MR.disaggregatedOPV}
                            />
                        </TabPane>

                        <TabPane tab="Wastage(Daily)" key="3">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.store.MR.discardedOPV}
                            />
                        </TabPane>

                        <TabPane tab="Wastage(Sub-level)" key="4">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.store.MR.disaggregatedWastageOPV}
                            />
                        </TabPane>
                    </Tabs>
                </div>

                <div key="n" style={{ background: 'white' }}>
                    <Table dataSource={this.store.MR.opvTableData} columns={columns} loading={this.store.MR.loading} pagination={{ pageSize: 10 }} rowKey="id" scroll={{ x: true }} size="middle" />
                </div>
                <div key="o" style={{ background: 'white' }}>
                    <Table dataSource={this.store.MR.cumulativeOPVTableData} columns={columns} loading={this.store.MR.loading} pagination={{ pageSize: 10 }} rowKey="id" scroll={{ x: true }} size="middle" />
                </div>
                <div key="g" style={{ background: 'white' }}>
                    <MapChart options={this.store.MR.opvMap} />
                </div>
                <div key="h" style={{ background: 'white' }} className="flex-center">
                    <div className="container" style={{ width: '50%' }}>
                        <div style={{
                            color: '#000066'
                        }}>DOSES ISSUED</div>
                        <div className="red">{this.store.MR.opvTextValues.no_vaccine_vials_issued ? this.store.MR.opvTextValues.no_vaccine_vials_issued * 20 : 0}</div>
                    </div>

                    <div className="container" style={{ width: '50%' }}>
                        <div style={{ color: '#000066' }}>DOSES USED</div>
                        <div className="red">{this.store.MR.opvTextValues.used ? this.store.MR.opvTextValues.used: 0}</div>
                    </div>
                </div>
                <div key="i" style={{ background: 'white' }} className="flex-center">
                    <div className="container" style={{ width: '50%' }}>
                        <div style={{ color: '#000066' }}>DOSES DISCARDED</div>
                        <div className="red">{this.store.MR.opvTextValues.no_vials_discarded ? this.store.MR.opvTextValues.no_vials_discarded * 20 : 0}</div>
                    </div>

                    <div className="container" style={{ width: '50%' }}>
                        <div style={{ color: '#000066' }}>CHILDREN VACCINATED</div>
                        <div className="green">{this.store.MR.opvTextValues.children_vaccinated}</div>
                    </div>
                </div>
                <div key="j" style={{ background: 'white' }}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={this.store.MR.wastageOPVGraph}
                    />
                </div>
                <div key="k" style={{ background: 'white' }} className="flex-center">
                    <div className="container" style={{ width: '50%' }}>
                        <div style={{
                            color: '#000066'
                        }}>WASTAGE</div>
                        <div className="red">{this.store.MR.opvTextValues.wastage ? (this.store.MR.opvTextValues.wastage * 100).toFixed(1) : 0}%</div>
                    </div>

                    <div className="container" style={{ width: '50%' }}>
                        <Progress type="circle" strokeWidth={15} showInfo={false} percent={this.store.MR.opvTextValues.wastage ? this.store.MR.opvTextValues.wastage * 100 : 0} width={80} />
                    </div>
                </div>
                <div key="l" style={{ background: 'white' }} className="flex-center">

                    <div className="container" style={{ width: '50%' }}>
                        <div style={{
                            color: '#000066'
                        }}>HEALTH WORKERS</div>
                        <div className="red">{this.store.MR.opvTextValues.number_health_workers}</div>
                    </div>

                    <div className="container" style={{ width: '50%' }}>
                        <div style={{
                            color: '#000066'
                        }}>WORKLOAD</div>
                        <div className="green">{this.store.MR.opvTextValues.workload}</div>
                    </div>
                </div>
            </ResponsiveGridLayout>
        )
    }
}

export default OPVDashboard
