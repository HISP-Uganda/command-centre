import React from 'react'
import { inject, observer } from "mobx-react";

import { Menu, Card, Row, Col } from 'antd';
import { SearchOrgUnit } from './SearchOrgUnit';
import PeriodDialog from './dialogs/PeriodDialog'


import Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official';
import gauge from 'highcharts/modules/solid-gauge';
import data from 'highcharts/modules/data';
import maps from 'highcharts/modules/map';
import exporting from 'highcharts/modules/exporting';
import fullScreen from 'highcharts/modules/full-screen';

import { TextValue } from './displays'
import Loading from './Loading';

HC_more(Highcharts);
gauge(Highcharts);
data(Highcharts);
maps(Highcharts);
exporting(Highcharts);
fullScreen(Highcharts)

@inject('store')
@observer
class ManagementDashboard extends React.Component {
    store = null;
    chart;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }
    componentDidMount() {
        this.store.fetchManagement();
    }

    render() {
        const { d2 } = this.props;
        return (
            <div>
                <Menu mode="horizontal" style={{ display: 'flex' }}>
                    <Menu.Item key="malaria" onClick={this.store.management.setSection('w48DM92Ed48')}>
                        MALARIA
                    </Menu.Item>
                    <Menu.Item key="mch" onClick={this.store.management.setSection('In9rCBCxByj')}>
                        MATERNAL CHILD HEALTH
                    </Menu.Item>
                    <Menu.Item key="reporting" onClick={this.store.management.setSection('B5KvsE97qFu')}>
                        ROUTINE IMMUNIZATION
                    </Menu.Item>
                    <Menu.Item key="immunization" onClick={this.store.management.setSection('cs3uA6FLvw3')}>
                        REPORTING
                    </Menu.Item>

                    <Menu.Item key="hmis">
                        <a href="https://hmis2.health.go.ug/hmis2/dhis-web-dashboard/#/U8DQZfjqXXz" target="_blank" rel="noopener noreferrer">NATIONAL HMIS</a>
                    </Menu.Item>
                    <div style={{ marginLeft: 'auto', marginRight: 10, display: 'flex', alignItems: 'center' }}>
                        <SearchOrgUnit value={this.store.management.currentValue} onChange={this.store.management.setCurrentSearch} style={{ width: 300 }} placeholder="Filter by Organisation" />
                        &nbsp;
                        <PeriodDialog d2={d2} />
                    </div>
                </Menu>

                <Menu mode="horizontal">
                    <Menu.Item key="4">
                        {this.store.management.description}
                    </Menu.Item>
                </Menu>

                {!this.store.management.loading ? <div style={{ padding: 10 }}>
                    <Row style={{ marginBottom: 10 }} gutter={[16, 16]}>
                        {this.store.management.summaryData.map((d, i) =>
                            <Col key={d.name} span={this.store.management.columns[i]}>
                                <Card style={{ height: '100%' }}>
                                    <TextValue color="#000066" label={d.name} value={d.y} className="management" />
                                </Card>
                            </Col>
                        )}
                    </Row>
                    {this.store.management.lineCharts.map((d, i) => <Row gutter={[16, 16]} key={i}>
                        {d.map((g, j) => (
                            <Col key={`${i}${j}`} span={12}>
                                <Card>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={g}
                                    />
                                </Card></Col>
                        ))}
                    </Row>)}
                </div> : <Loading />}

            </div>
        )
    }
}
export default ManagementDashboard
