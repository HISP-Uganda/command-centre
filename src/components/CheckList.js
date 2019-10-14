import React from 'react';
import { inject, observer } from "mobx-react";
import { Card, Col, Row, Tabs, Button, Menu, Progress, Icon, Modal } from 'antd';
import * as PropTypes from 'prop-types'
import Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official';
import gauge from 'highcharts/modules/solid-gauge';
import data from 'highcharts/modules/data';
import maps from 'highcharts/modules/map';
import MapChart from './Map';
import OuTreeDialog from './dialogs/OuTreeDialog'

import * as am4core from "@amcharts/amcharts4/core";
// import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

HC_more(Highcharts);
gauge(Highcharts);
data(Highcharts)
maps(Highcharts)
const { TabPane } = Tabs;
@inject('store')
@observer
class CheckList extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    callback = (key) => {
        console.log(key);
    }
    componentDidMount() {

    }


    render() {
        return <div>
            OPV
        </div>
    }

}

export default CheckList
