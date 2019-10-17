import React from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Tabs, Progress } from 'antd';
import OuTreeDialog from './dialogs/OuTreeDialog';
import { inject, observer } from "mobx-react";
import Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official';
import gauge from 'highcharts/modules/solid-gauge';
import data from 'highcharts/modules/data';
import maps from 'highcharts/modules/map';
import MapChart from './Map';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

HC_more(Highcharts);
gauge(Highcharts);
data(Highcharts)
maps(Highcharts)
const { TabPane } = Tabs;

const ResponsiveGridLayout = WidthProvider(Responsive);

@inject('store')
@observer
class MRDashboard extends React.Component {
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
        this.chart = this.store.MR.gauge;
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
                { i: 'a', x: 0, y: 0, w: 9, h: 1 },
                { i: 'b', x: 10, y: 0, w: 3, h: 1 },
                { i: 'd', x: 0, y: 2, w: 6, h: 2 },
                { i: 'e', x: 6, y: 2, w: 3, h: 4 },
                { i: 'f', x: 0, y: 2, w: 6, h: 11 },
                { i: 'g', x: 6, y: 2, w: 3, h: 9 },
                { i: 'h', x: 10, y: 1, w: 3, h: 2 },
                { i: 'i', x: 10, y: 2, w: 3, h: 2 },
                { i: 'j', x: 10, y: 3, w: 3, h: 5 },
                { i: 'k', x: 10, y: 4, w: 3, h: 2 },
                { i: 'l', x: 10, y: 5, w: 3, h: 2 }
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
            >
                <div key="a" style={{ background: 'white' }}>
                    <div
                        className="headers"
                        style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
                    >
                        <div style={{ fontSize: 20, textAlign: 'center' }}>MEASLES RUBELLA (MR) - {this.store.selected.length > 0 ? this.store.selected[0].displayName : ''}</div>
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
                        }}>VACCINATION POSTS</div>
                        <div className="red">{this.store.MR.textValues.posts}</div>
                    </div>
                    <div className="container" style={{ width: "20%" }}>
                        <div style={{ color: '#000066' }}>VACCINATION TARGET</div>
                        <div className="red">{this.store.MR.textValues.target_population}</div>
                    </div>

                    <div className="container" style={{ width: "20%" }}>
                        <div style={{ color: '#000066' }}>CHILDREN VACCCINATED</div>
                        <div className="green">{this.store.MR.textValues.children_vaccinated}</div>
                    </div>

                    <div style={{ width: '20%', textAlign: "center", display: 'flex', flexDirection: 'column' }}>
                        <span className="big-number-cv">{this.store.MR.textValues.covarage}%</span>
                        <span style={{ margin: -15 }}>MR Coverage</span>
                    </div>
                    <Progress strokeWidth={15} showInfo={false} type="circle" percent={parseFloat(this.store.MR.textValues.covarage)} width={80} style={{ width: '20%', textAlign: "center" }} />
                </div>
                <div key="e" style={{ background: 'white' }}>
                    <div id="chartdiv" style={{ width: "100%", height: "250px" }}></div>
                </div>
                <div key="f" style={{ background: 'white' }}>
                    <Tabs defaultActiveKey="1" onChange={this.callback}>
                        <TabPane tab="Performance(Daily)" key="1">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.store.MR.vaccinated}
                            />
                        </TabPane>
                        <TabPane tab="Performance(Sub-level)" key="2">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.store.MR.disaggregated}
                            />
                        </TabPane>

                        <TabPane tab="Wastage(Daily)" key="3">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.store.MR.discarded}
                            />
                        </TabPane>

                        <TabPane tab="Wastage(Sub-level)" key="4">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.store.MR.disaggregatedWastage}
                            />
                        </TabPane>
                    </Tabs>
                </div>
                <div key="g" style={{ background: 'white' }}>
                    <MapChart options={this.store.MR.map} />
                </div>
                <div key="h" style={{ background: 'white' }} className="flex-center">
                    <div className="container" style={{ width: '50%' }}>
                        <div style={{
                            color: '#000066'
                        }}>ISSUED</div>
                        <div className="red">{this.store.MR.textValues.no_vaccine_vials_issued ? this.store.MR.textValues.no_vaccine_vials_issued * 10 : 0}</div>
                    </div>

                    <div className="container" style={{ width: '50%' }}>
                        <div style={{ color: '#000066' }}>RETURNED</div>
                        <div className="red">{this.store.MR.textValues.no_vaccine_vials_returned_unopened ? this.store.MR.textValues.no_vaccine_vials_returned_unopened * 10 : 0}</div>
                    </div>
                </div>
                <div key="i" style={{ background: 'white' }} className="flex-center">
                    <div className="container" style={{ width: '50%' }}>
                        <div style={{ color: '#000066' }}>DISCARDED</div>
                        <div className="red">{this.store.MR.textValues.no_vials_discarded ? this.store.MR.textValues.no_vials_discarded * 10 : 0}</div>
                    </div>

                    <div className="container" style={{ width: '50%' }}>
                        <div style={{ color: '#000066' }}>ADMINISTERED</div>
                        <div className="green">{this.store.MR.textValues.children_vaccinated}</div>
                    </div>
                </div>
                <div key="j" style={{ background: 'white' }}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={this.store.MR.wastageGraph}
                    />
                </div>
                <div key="k" style={{ background: 'white' }} className="flex-center">
                    <div className="container" style={{ width: '50%' }}>
                        <div style={{
                            color: '#000066'
                        }}>WASTAGE</div>
                        <div className="red">{this.store.MR.textValues.wastage ? (this.store.MR.textValues.wastage * 100).toFixed(1) : 0}%</div>
                    </div>

                    <div className="container" style={{ width: '50%' }}>
                        <Progress type="circle" strokeWidth={15} showInfo={false} percent={this.store.MR.textValues.wastage ? this.store.MR.textValues.wastage * 100 : 0} width={80} />
                    </div>
                </div>
                <div key="l" style={{ background: 'white' }} className="flex-center">

                    <div className="container" style={{ width: '50%' }}>
                        <div style={{
                            color: '#000066'
                        }}>HEALTH WORKERS</div>
                        <div className="red">{this.store.MR.textValues.number_health_workers}</div>
                    </div>

                    <div className="container" style={{ width: '50%' }}>
                        <div style={{
                            color: '#000066'
                        }}>WORKLOAD</div>
                        <div className="green">{this.store.MR.textValues.workload}</div>
                    </div>
                </div>
            </ResponsiveGridLayout>
        )
    }
}

export default MRDashboard
