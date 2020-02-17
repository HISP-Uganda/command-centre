import React from 'react'
import { Tabs, Progress } from 'antd';

import Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official';
import gauge from 'highcharts/modules/solid-gauge';
import data from 'highcharts/modules/data';
import maps from 'highcharts/modules/map';
import exporting from 'highcharts/modules/exporting';
import fullScreen from 'highcharts/modules/full-screen';
import OuTreeDialog from './dialogs/OuTreeDialog';
import MapChart from './Map';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { CCMap } from './CCMap';

HC_more(Highcharts);
gauge(Highcharts);
data(Highcharts);
maps(Highcharts);
exporting(Highcharts);
fullScreen(Highcharts);

const { TabPane } = Tabs;

const ResponsiveGridLayout = WidthProvider(Responsive);

const layouts = {
    lg: [
        { "w": 9, "h": 1, "x": 0, "y": 0, "i": "a", "moved": false, "static": true },
        { "w": 3, "h": 1, "x": 9, "y": 0, "i": "b", "moved": false, "static": true },
        { "w": 6, "h": 2, "x": 0, "y": 1, "i": "d", "moved": false, "static": true },
        { "w": 6, "h": 2, "x": 0, "y": 3, "i": "m", "moved": false, "static": true },
        { "w": 3, "h": 4, "x": 6, "y": 1, "i": "e", "moved": false, "static": true },
        { "w": 6, "h": 9, "x": 0, "y": 5, "i": "f", "moved": false, "static": true },
        { "w": 12, "h": 11, "x": 0, "y": 14, "i": "n", "moved": false, "static": true },
        { "w": 12, "h": 11, "x": 0, "y": 25, "i": "o", "moved": false, "static": true },
        { "w": 3, "h": 9, "x": 6, "y": 5, "i": "g", "moved": false, "static": true },
        { "w": 3, "h": 2, "x": 9, "y": 1, "i": "h", "moved": false, "static": true },
        { "w": 3, "h": 2, "x": 9, "y": 3, "i": "i", "moved": false, "static": true },
        { "w": 3, "h": 5, "x": 9, "y": 5, "i": "j", "moved": false, "static": true },
        { "w": 3, "h": 2, "x": 9, "y": 10, "i": "k", "moved": false, "static": true },
        { "w": 3, "h": 2, "x": 9, "y": 12, "i": "l", "moved": false, "static": true }
    ]
}
export const MainTab = ({ vaccinated, disaggregated, wastage, disaggregatedWastage }) => {
    return <Tabs defaultActiveKey="1">
        <TabPane tab="Performance(Daily)" key="1">
            <HighchartsReact
                highcharts={Highcharts}
                options={vaccinated}
            />
        </TabPane>
        <TabPane tab="Performance(Sub-level)" key="2">
            <HighchartsReact
                highcharts={Highcharts}
                options={disaggregated}
            />
        </TabPane>

        <TabPane tab="Wastage(Daily)" key="3">
            <HighchartsReact
                highcharts={Highcharts}
                options={wastage}
            />
        </TabPane>

        <TabPane tab="Wastage(Sub-level)" key="4">
            <HighchartsReact
                highcharts={Highcharts}
                options={disaggregatedWastage}
            />
        </TabPane>
    </Tabs>
}


export const TextValue = ({ color, label, value, className, width }) => {
    return <div className="container" style={{ width }}>
        <div style={{
            color
        }}>{label}</div>
        <div className={className}>{String(value)}</div>
    </div>
}


export const Form4 = ({ d2, disease, location, map, vials, used, vaccinated, vaccinatedGraphData, target, coverage, wastageGraphData, wastage, workers, workload, disaggregatedGraphData, disaggregatedWastageGraphData, onOrgUnitSelect, discarded, wastageSummary }) => {

    return <ResponsiveGridLayout className="layout" layouts={layouts}
        breakpoints={{ xxl: 3400, lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ xxl: 12, lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={56}
    >
        <div key="a" style={{ background: 'white' }}>
            <div
                className="headers"
            >
                <div style={{ fontSize: 20, textAlign: 'center' }}>{disease} - {location}</div>
                <OuTreeDialog d2={d2} onOrgUnitSelect={onOrgUnitSelect} />
            </div>
        </div>

        <div key="b" style={{ background: 'white' }}>
            <div
                className="headers"
            // style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
            >
                <div key="1" style={{ fontSize: 20, textAlign: 'center' }}>STOCK AND WASTAGE SUMMARY</div>
            </div>
        </div>

        <div key="m" style={{ background: 'white' }}>
            <MainTab vaccinated={vaccinatedGraphData} disaggregated={disaggregatedGraphData} wastage={wastageGraphData} disaggregatedWastage={disaggregatedWastageGraphData} />
        </div>

        <div key="d" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="POPULATION TARGET" value={target} width="25%" className="red" />
            <TextValue color="#000066" label="VACCINATED" value={vaccinated} width="25%" className="green" />
            <TextValue color="#000066" label="COVERAGE" value={coverage + '%'} width="25%" className="green" />
            <Progress strokeWidth={15} showInfo={false} type="circle" percent={coverage} width={80} style={{ width: '25%', textAlign: "center" }} />
        </div>

        <div key="e" style={{ background: 'white' }}>
            <div id="chartdiv" style={{ width: "100%", height: "250px" }}>
            </div>
        </div>
        <div key="g" >
            <CCMap map={map} />
        </div>

        <div key="h" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="DOSES ISSUED" value={vials} width="50%" className="red" />
            <TextValue color="#000066" label="DOSES USED" value={used} width="50%" className="red" />
        </div>
        <div key="i" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="DOSES DISCARDED" value={discarded} width="50%" className="red" />
            <TextValue color="#000066" label="CHILDREN VACCINATED" value={vaccinated} width="50%" className="green" />
        </div>
        <div key="j" style={{ background: 'white' }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={wastageSummary}
            />
        </div>
        <div key="k" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="WASTAGE" value={wastage + '%'} width="50%" className="red" />
            <div className="container" style={{ width: '50%' }}>
                <Progress type="circle" strokeWidth={15} showInfo={false} percent={wastage} width={80} />
            </div>
        </div>
        <div key="l" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="No. HEALTH WORKERS" value={workers} width="50%" className="red" />
            <TextValue color="#000066" label="WORKLOAD" value={workload} width="50%" className="green" />
        </div>
    </ResponsiveGridLayout>
}


export const Form2 = ({ d2, disease, location, map, vials, used, vaccinated, vaccinatedGraphData, target, coverage, wastageGraphData, wastage, workers, workload, disaggregatedGraphData, disaggregatedWastageGraphData, onOrgUnitSelect, discarded, wastageSummary, totalPosts, postsReporting, reportingRates }) => {
    return <ResponsiveGridLayout className="layout" layouts={layouts}
        breakpoints={{ xxl: 3400, lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ xxl: 12, lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={56}
        onLayoutChange={(layout) => console.log(JSON.stringify(layout))}
    >
        <div key="a" style={{ background: 'white' }}>
            <div
                className="headers"
            // style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
            >
                <div style={{ fontSize: 20, textAlign: 'center' }}>{disease} - {location}</div>
                <OuTreeDialog d2={d2} onOrgUnitSelect={onOrgUnitSelect} />
            </div>
        </div>

        <div key="b" style={{ background: 'white' }}>
            <div
                className="headers"
            // style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
            >
                <div key="1" style={{ fontSize: 20, textAlign: 'center' }}>STOCK AND WASTAGE SUMMARY</div>
            </div>
        </div>

        <div key="f" style={{ background: 'white' }}>
            <MainTab vaccinated={vaccinatedGraphData} disaggregated={disaggregatedGraphData} wastage={wastageGraphData} disaggregatedWastage={disaggregatedWastageGraphData} />
        </div>

        <div key="d" style={{ background: 'white' }} className="flex-center">

            <TextValue color="#000066" label="TOTAL NO. OF POSTS" value={totalPosts} width="25%" className="red" />
            <TextValue color="#000066" label="NO. OF POSTS REPORTING" value={postsReporting} width="25%" className="red" />
            <TextValue color="#000066" label="REPORTING RATES" value={reportingRates + '%'} width="25%" className="red" />
            <Progress strokeWidth={15} showInfo={false} type="circle" percent={reportingRates} width={80} style={{ width: '25%', textAlign: "center" }} />
        </div>


        <div key="m" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="POPULATION TARGET" value={target} width="25%" className="red" />
            <TextValue color="#000066" label="VACCINATED" value={vaccinated} width="25%" className="green" />
            <TextValue color="#000066" label="COVERAGE" value={coverage + '%'} width="25%" className="green" />
            <Progress strokeWidth={15} showInfo={false} type="circle" percent={coverage} width={80} style={{ width: '25%', textAlign: "center" }} />
        </div>

        <div key="e" style={{ background: 'white' }}>
            <div id="chartdiv" style={{ width: "100%", height: "250px" }}>
            </div>
        </div>
        <div key="g" style={{ background: 'white' }}>
            <MapChart options={map} />
        </div>

        <div key="h" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="DOSES ISSUED" value={vials} width="50%" className="red" />
            <TextValue color="#000066" label="DOSES USED" value={used} width="50%" className="red" />
        </div>
        <div key="i" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="DOSES DISCARDED" value={discarded} width="50%" className="red" />
            <TextValue color="#000066" label="CHILDREN VACCINATED" value={vaccinated} width="50%" className="green" />
        </div>
        <div key="j" style={{ background: 'white' }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={wastageSummary}
            />
        </div>
        <div key="k" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="WASTAGE" value={wastage + '%'} width="50%" className="red" />
            <div className="container" style={{ width: '50%' }}>
                <Progress type="circle" strokeWidth={15} showInfo={false} percent={wastage} width={80} />
            </div>
        </div>
        <div key="l" style={{ background: 'white' }} className="flex-center">
            <TextValue color="#000066" label="No. HEALTH WORKERS" value={workers} width="50%" className="red" />
            <TextValue color="#000066" label="WORKLOAD" value={workload} width="50%" className="green" />
        </div>
    </ResponsiveGridLayout>
}