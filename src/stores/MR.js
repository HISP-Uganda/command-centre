import { action, computed, observable } from 'mobx';
import socketClient from 'socket.io-client';
import axios from 'axios';
import { isEmpty, fromPairs } from 'lodash';
// import mapData from './mapData';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

// import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { flatten } from '@amcharts/amcharts4/.internal/core/utils/Iterator';

am4core.useTheme(am4themes_animated);
const url = 'https://mrengine.hispuganda.org';
// const url = 'http://localhost:3001';
const socket = socketClient(url);


const findDay = (val) => {
    if (val === String('ZpyTYdeiDkA').toLowerCase()) {
        return 'Day One'
    } else if (val === String('aEqdGN2HOLQ').toLowerCase()) {
        return 'Day Two';
    } else if (val === String('WybnHDOJacu').toLowerCase()) {
        return 'Day Three';
    } else if (val === String('UK2et7FhfIq').toLowerCase()) {
        return 'Day Four';
    } else if (val === String('jRUmp92Y4bE').toLowerCase()) {
        return 'Day 5';
    } else {
        return 'HllvX50cXC0'
    }
}


export class MR {

    @observable data;
    @observable opvData;
    @observable daily = [];
    @observable dailyOPV = [];
    @observable summary = [];
    @observable opvSummary = [];
    @observable accumulate = false;
    @observable single = {};
    @observable singleOPV = {};
    @observable currentSearch;
    @observable currentValue;
    @observable mapData;
    @observable currentUnits = {}
    @observable d2;
    @observable mapData;
    @observable opvMapData;
    @observable mapSearch = 'Subcounty';
    @observable currentMapSearch;


    constructor() {
        socket.on("data", () => this.fetchData());
        // this.fetchData();
    }

    @action setAccumulate = async (e) => {
        this.accumulate = e.target.checked;
        await this.fetchData();
    }

    @action setD2 = val => this.d2 = val;

    @action setCurrentSearch = async val => {
        this.currentValue = val.id;

        const level = val.path.split('/').length - 1;

        if (level === 2) {
            this.currentSearch = 'regions';
        } else if (level === 3) {
            this.currentSearch = 'districts'
        } else if (level === 4) {
            this.currentSearch = 'subcounties'
        }

        const api = this.d2.Api.getApi();

        const { children } = await api.get('organisationUnits/' + val.id, { fields: 'children[id,name]' });

        this.currentUnits = fromPairs(children.map(child => [String(child.id).toLowerCase(), child.name]));

        if (this.currentSearch && this.currentSearch === 'districts') {
            const district = String(val.displayName);
            const { data: map } = await axios.get(`${url}/uganda?search=${district}`);
            this.mapData = map;
        }
        if (level === 1) {
            const { data: map } = await axios.get(`${url}/country`);
            this.mapData = map;
            this.mapSearch = 'District18';
            this.currentMapSearch = 'regions';
        }
        await this.fetchData();
    };

    @action
    fetchData = async () => {
        try {
            const { data: { aggregations: { data: { buckets }, overall: { buckets: daily }, single, summary: { buckets: summary } } } } = await axios.get(this.currentUrl);
            this.data = buckets;
            this.daily = daily
            this.summary = summary
            this.single = single

            const { data: { aggregations: { data: { buckets: opvData }, overall: { buckets: dailyOPV }, single: singleOPV, summary: { buckets: opvSummary } } } } = await axios.get(this.currentOPVUrl);
            this.opvData = opvData;
            this.dailyOPV = dailyOPV
            this.opvSummary = opvSummary
            this.singleOPV = singleOPV

            const opvMapUrls = summary.map(d => {
                const h = `${url}/opv?type=${this.currentMapSearch}&search=${d.key}`;
                return axios.get(h)
            });
            const api = this.d2.Api.getApi();

            const { organisationUnits } = await api.get('organisationUnits', { fields: 'id,name', level: 3 });

            const currentDistricts = fromPairs(organisationUnits.map(child => [String(child.id).toLowerCase(), child.name]));

            const opv = await Promise.all(opvMapUrls);

            const intermediate = opv.map(response => {
                const { data: { aggregations: { summary: { buckets: opvSummary } } } } = response;
                return opvSummary.map(d => {

                    const denominator = parseInt(d['target_population']['value'], 10);
                    const numerator = parseInt(d['children_vaccinated']['value'], 10);
                    let value = 0;
                    if (!isNaN(denominator) && !isNaN(numerator)) {
                        value = denominator !== 0 ? numerator * 100 / denominator : 0
                    }
                    return [currentDistricts[d.key], value]

                })
            });
            this.opvMapData = flatten(intermediate)
        } catch (error) {
            console.log(error)
        }
    }

    @computed
    get currentUrl() {
        if (this.currentSearch && this.currentValue) {
            return `${url}/?type=${this.currentSearch}&search=${this.currentValue}`
        }
        return url;
    }

    @computed
    get currentOPVUrl() {
        if (this.currentSearch && this.currentValue) {
            return `${url}/opv?type=${this.currentSearch}&search=${this.currentValue}`
        }
        return `${url}/opv`;
    }

    // @computed
    // get currentOPVMapUrl() {
    //     if (this.currentMapSearch && this.summary) {
    //         return this.summary(d => {
    //             return `${url}/opv?type=${this.currentMapSearch}&search=${d.key}`
    //         })
    //     }
    //     return []
    // }

    @computed
    get vaccinated() {

        if (this.accumulate) {

        }

        let vaccinated = this.daily.map(d => {
            return {
                y: d['children_vaccinated']['value'],
                name: findDay(d.key)

            }
        });

        let target = this.daily.map(d => {
            return {
                y: d['target_population']['value'],
                name: findDay(d.key)
            }
        });
        return {
            chart: {
                type: 'column',
                height: '55%',
                reflow: true
            },
            xAxis: {
                type: 'category'
            },
            title: {
                text: 'Number of children vaccinated VS target per day (Measles MR)'
            },
            legend: {
                enabled: true
            },

            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: [{
                name: 'Target',
                data: target
            }, {
                name: 'Vaccinated',
                data: vaccinated
            }]
        }
    }


    @computed
    get vaccinatedOPV() {

        if (this.accumulate) {

        }

        let vaccinated = this.dailyOPV.map(d => {
            return {
                y: d['children_vaccinated']['value'],
                name: findDay(d.key)

            }
        });

        let target = this.dailyOPV.map(d => {
            return {
                y: d['target_population']['value'],
                name: findDay(d.key)
            }
        });

        return {
            chart: {
                type: 'column',
                height: '55%',
                reflow: true
            },
            xAxis: {
                type: 'category'
            },
            title: {
                text: 'Number of children vaccinated VS target per day (OPV)'
            },

            legend: {
                enabled: true
            },

            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: [{
                name: 'Target',
                data: target
            }, {
                name: 'Vaccinated',
                data: vaccinated
            }]
        }
    }

    @computed
    get disaggregated() {
        if (!isEmpty(this.currentUnits)) {
            let vaccinated = this.summary.map(d => {
                return {
                    y: d['children_vaccinated']['value'],
                    name: this.currentUnits[d.key]
                }
            });

            let target = this.summary.map(d => {
                return {
                    y: d['target_population']['value'],
                    name: this.currentUnits[d.key]

                }
            });

            return {
                chart: {
                    type: 'column',
                    height: '55%'
                },
                xAxis: {
                    type: 'category'
                },
                title: {
                    text: 'Number of children vaccinated VS target disaggregated by sub-level (Measles MR)'
                },

                legend: {
                    enabled: true
                },

                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'Target',
                    data: target
                }, {
                    name: 'Vaccinated',
                    data: vaccinated
                }]
            }
        }

        return {};
    }

    @computed
    get disaggregatedOPV() {
        if (!isEmpty(this.currentUnits)) {
            let vaccinated = this.opvSummary.map(d => {
                return {
                    y: d['children_vaccinated']['value'],
                    name: this.currentUnits[d.key]
                }
            });

            let target = this.opvSummary.map(d => {
                return {
                    y: d['target_population']['value'],
                    name: this.currentUnits[d.key]

                }
            });


            return {
                chart: {
                    type: 'column',
                    height: '55%'
                },
                xAxis: {
                    type: 'category'
                },
                title: {
                    text: 'Number of children vaccinated VS target disaggregated by sub-level (OPV)'
                },
                legend: {
                    enabled: true
                },

                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'Target',
                    data: target
                }, {
                    name: 'Vaccinated',
                    data: vaccinated
                }]
            }
        }

        return {};
    }

    @computed
    get disaggregatedWastage() {

        let contamination = this.summary.map(d => {
            return {
                y: d['no_vials_discarded_due_contamination']['value'],
                name: this.currentUnits[d.key]
            }
        });

        let partial = this.summary.map(d => {
            return {
                y: d['no_vials_discarded_due_partial_use']['value'],
                name: this.currentUnits[d.key]
            }
        });

        let changed = this.summary.map(d => {
            return {
                y: d['no_vials_discarded_due_vvm_color_change']['value'],
                name: this.currentUnits[d.key]
            }
        });

        let unopen = this.summary.map(d => {

            return {
                y: d['no_vaccine_vials_returned_unopened']['value'],
                name: this.currentUnits[d.key]
            }
        });

        return {
            chart: {
                type: 'column',
                height: '55%'
            },
            xAxis: {
                type: 'category'
            },
            title: {
                text: 'Reasons for discarding Measles Rubella vials disaggregated by sub-level'
            },
            legend: {
                enabled: true
            },

            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: [{
                name: 'Contaminated',
                data: contamination
            }, {
                name: 'Partially Used',
                data: partial
            }, {
                name: 'Changed Color',
                data: changed
            }, {
                name: 'Returned',
                data: unopen
            }]
        }
    }


    @computed
    get disaggregatedWastageOPV() {

        let contamination = this.opvSummary.map(d => {
            return {
                y: d['no_vials_discarded_due_contamination']['value'],
                name: this.currentUnits[d.key]
            }
        });

        let partial = this.summary.map(d => {
            return {
                y: d['no_vials_discarded_due_partial_use']['value'],
                name: this.currentUnits[d.key]
            }
        });

        let changed = this.opvSummary.map(d => {
            return {
                y: d['no_vials_discarded_due_vvm_color_change']['value'],
                name: this.currentUnits[d.key]
            }
        });

        let unopen = this.opvSummary.map(d => {

            return {
                y: d['no_vaccine_vials_returned_unopened']['value'],
                name: this.currentUnits[d.key]
            }
        });

        return {
            chart: {
                type: 'column',
                height: '55%'
            },
            xAxis: {
                type: 'category'
            },
            title: {
                text: 'Reasons for discarding OPV vials disaggregated by sub-level'
            },
            legend: {
                enabled: true
            },

            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: [{
                name: 'Contaminated',
                data: contamination
            }, {
                name: 'Partially Used',
                data: partial
            }, {
                name: 'Changed Color',
                data: changed
            }, {
                name: 'Returned',
                data: unopen
            }]
        }
    }

    @computed
    get discarded() {

        let contamination = this.daily.map(d => {
            return {
                y: d['no_vials_discarded_due_contamination']['value'],
                name: findDay(d.key)
            }
        });

        let partial = this.daily.map(d => {
            return {
                y: d['no_vials_discarded_due_partial_use']['value'],
                name: findDay(d.key)
            }
        });

        let changed = this.daily.map(d => {
            return {
                y: d['no_vials_discarded_due_vvm_color_change']['value'],
                name: findDay(d.key)
            }
        });

        let unopen = this.daily.map(d => {
            return {
                y: d['no_vaccine_vials_returned_unopened']['value'],
                name: findDay(d.key)
            }
        });


        return {
            chart: {
                type: 'column',
                height: '55%'
            },
            xAxis: {
                type: 'category'
            },
            title: {
                text: 'Reasons for discarding MR Measles vials per day'
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true
                    }
                }
            },

            series: [{
                name: 'Contaminated',
                data: contamination
            }, {
                name: 'Partially Used',
                data: partial
            }, {
                name: 'Changed Color',
                data: changed
            }, {
                name: 'Returned',
                data: unopen
            }]
        }
    }

    @computed
    get discardedOPV() {

        let contamination = this.dailyOPV.map(d => {
            return {
                y: d['no_vials_discarded_due_contamination']['value'],
                name: findDay(d.key)
            }
        });

        let partial = this.dailyOPV.map(d => {
            return {
                y: d['no_vials_discarded_due_partial_use']['value'],
                name: findDay(d.key)
            }
        });

        let changed = this.dailyOPV.map(d => {
            return {
                y: d['no_vials_discarded_due_vvm_color_change']['value'],
                name: findDay(d.key)
            }
        });

        let unopen = this.dailyOPV.map(d => {
            return {
                y: d['no_vaccine_vials_returned_unopened']['value'],
                name: findDay(d.key)
            }
        });


        return {
            chart: {
                type: 'column',
                height: '55%'
            },
            xAxis: {
                type: 'category'
            },
            title: {
                text: 'Reasons for discarding OPV vials per day'
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true
                    }
                }
            },

            series: [{
                name: 'Contaminated',
                data: contamination
            }, {
                name: 'Partially Used',
                data: partial
            }, {
                name: 'Changed Color',
                data: changed
            }, {
                name: 'Returned',
                data: unopen
            }]
        }
    }


    @computed
    get textValues() {
        if (!isEmpty(this.single)) {
            const expected = (this.single['no_vaccine_vials_issued']['value'] - this.single['no_vaccine_vials_returned_unopened']['value']) * 10;
            const vaccinated = this.single['children_vaccinated']['value'];
            const target = this.single['target_population']['value'];
            let wastage = (expected - vaccinated) / expected
            let dosage = vaccinated / expected
            wastage = wastage.toFixed(2);
            dosage = dosage.toFixed(2);
            wastage = isNaN(wastage) ? 0 : wastage
            dosage = isNaN(dosage) ? 0 : dosage
            let covarage = (vaccinated * 100 / target).toFixed(1);
            covarage = isNaN(covarage) ? 0 : covarage
            const obj = Object.assign({}, ...Object.keys(this.single).map(k => ({ [k]: this.single[k].value })));
            let workload = vaccinated / this.single['number_health_workers']['value']
            workload = isNaN(workload) ? 0 : workload
            return { ...obj, wastage, dosage, workload: workload.toFixed(1), covarage }
        }
        return { wastage: 0, dosage: 0, workload: 0, covarage: 0 };
    }

    @computed
    get opvTextValues() {
        if (!isEmpty(this.singleOPV)) {
            const expected = (this.singleOPV['no_vaccine_vials_issued']['value'] - this.singleOPV['no_vaccine_vials_returned_unopened']['value']) * 10;
            const vaccinated = this.singleOPV['children_vaccinated']['value'];
            const target = this.singleOPV['target_population']['value'];
            let wastage = (expected - vaccinated) / expected
            let dosage = vaccinated / expected
            wastage = wastage.toFixed(2);
            dosage = dosage.toFixed(2);
            wastage = isNaN(wastage) ? 0 : wastage
            dosage = isNaN(dosage) ? 0 : dosage
            let covarage = (vaccinated * 100 / target).toFixed(1);
            covarage = isNaN(covarage) ? 0 : covarage
            const obj = Object.assign({}, ...Object.keys(this.singleOPV).map(k => ({ [k]: this.singleOPV[k].value })));
            let workload = vaccinated / this.singleOPV['number_health_workers']['value']
            workload = isNaN(workload) ? 0 : workload
            return { ...obj, wastage, dosage, workload: workload.toFixed(1), covarage }
        }
        return { wastage: 0, dosage: 0, workload: 0, covarage: 0 };
    }

    @computed
    get wastageGraph() {
        return {
            chart: {
                type: 'bar',
                height: '300px'
            },
            title: {
                text: 'Reasons for discarding MR Measles vials summary'
            },
            xAxis: {
                categories: [
                    'Partial Use',
                    'Contamination',
                    'VVM Color Change',
                    'Other Factors'
                ],
            },
            series: [{
                name: 'Wastage',
                data: [
                    this.textValues.no_vials_discarded_due_partial_use,
                    this.textValues.no_vials_discarded_due_contamination,
                    this.textValues.no_vials_discarded_due_vvm_color_change,
                    this.textValues.no_vials_discarded_other_factors
                ]
            }]
        }
    }

    @computed
    get wastageOPVGraph() {
        return {
            chart: {
                type: 'bar',
                height: '300px'
            },
            title: {
                text: 'Reasons for discarding OPV vials summary'
            },
            xAxis: {
                categories: [
                    'Partial Use',
                    'Contamination',
                    'VVM Color Change',
                    'Other Factors'
                ],
            },
            series: [{
                name: 'Wastage',
                data: [
                    this.opvTextValues.no_vials_discarded_due_partial_use,
                    this.opvTextValues.no_vials_discarded_due_contamination,
                    this.opvTextValues.no_vials_discarded_due_vvm_color_change,
                    this.opvTextValues.no_vials_discarded_other_factors
                ]
            }]
        }
    }

    @computed
    get map() {
        const computedData = this.summary.map(d => {
            const denominator = parseInt(d['target_population']['value'], 10);
            const numerator = parseInt(d['children_vaccinated']['value'], 10);
            let value = 0;
            if (!isNaN(denominator) && !isNaN(numerator)) {
                value = denominator !== 0 ? numerator * 100 / denominator : 0
            }
            return { location: String(this.currentUnits[d.key]).toUpperCase(), value }
        }).filter(x => !!x.location).map(c => {
            return [c.location, c.value]
        });
        return {
            chart: {
                map: this.mapData
            },

            title: {
                text: 'MR Rubella Vaccination Coverage'
            },

            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },
            tooltip: {
                pointFormat: `{point.properties.${this.mapSearch}}`
            },

            colorAxis: {
                tickPixelInterval: 100
            },
            series: [{
                data: computedData,
                keys: [this.mapSearch, 'value'],
                joinBy: this.mapSearch,
                name: 'Rubella (MR)',
                states: {
                    hover: {
                        color: '#a4edba'
                    }
                },
                // dataLabels: {
                //     enabled: true,
                //     format: `{point.properties.${this.mapSearch}}`
                // }
            }]
        }
    }

    @computed
    get opvMap() {
        const computedData = this.opvSummary.map(d => {
            const denominator = parseInt(d['target_population']['value'], 10);
            const numerator = parseInt(d['children_vaccinated']['value'], 10);
            let value = 0;
            if (!isNaN(denominator) && !isNaN(numerator)) {
                value = denominator !== 0 ? numerator * 100 / denominator : 0
            }

            return { location: String(this.currentUnits[d.key]).toUpperCase(), value }
        }).filter(x => !!x.location).map(c => {
            return [c.location, c.value]
        });
        return {
            chart: {
                map: this.mapData
            },

            title: {
                text: 'OPV Polio Vaccination Coverage'
            },

            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },
            tooltip: {
                pointFormat: `{point.properties.${this.mapSearch}}`
            },
            colorAxis: {
                tickPixelInterval: 100
            },

            series: [{
                data: computedData,
                keys: [this.mapSearch, 'value'],
                joinBy: this.mapSearch,
                name: 'OPV',
                states: {
                    hover: {
                        color: '#a4edba'
                    }
                },
                dataLabels: {
                    // enabled: true,
                    // format: `{point.properties.${this.mapSearch}}`
                }
            }]
        }
    }

    @computed get gauge() {
        // create chart
        var chart = am4core.create("chartdiv", am4charts.GaugeChart);
        chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

        chart.innerRadius = -25;

        var axis = chart.xAxes.push(new am4charts.ValueAxis());
        axis.min = 0;
        axis.max = 100;
        axis.strictMinMax = true;
        axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor("background");
        axis.renderer.grid.template.strokeOpacity = 0.3;

        // var colorSet = new am4core.ColorSet();

        var range0 = axis.axisRanges.create();
        range0.value = 0;
        range0.endValue = 50;
        range0.axisFill.fillOpacity = 1;
        range0.axisFill.fill = 'red';
        range0.axisFill.zIndex = - 1;

        var range1 = axis.axisRanges.create();
        range1.value = 50;
        range1.endValue = 80;
        range1.axisFill.fillOpacity = 1;
        range1.axisFill.fill = 'orange';
        range1.axisFill.zIndex = -1;

        var range2 = axis.axisRanges.create();
        range2.value = 80;
        range2.endValue = 95;
        range2.axisFill.fillOpacity = 1;
        range2.axisFill.fill = 'lime';
        range2.axisFill.zIndex = -1;

        var range3 = axis.axisRanges.create();
        range3.value = 95;
        range3.endValue = 100;
        range3.axisFill.fillOpacity = 1;
        range3.axisFill.fill = 'darkgreen';
        range3.axisFill.zIndex = -1;

        var hand = chart.hands.push(new am4charts.ClockHand());

        // using chart.setTimeout method as the timeout will be disposed together with a chart
        chart.setTimeout(randomValue, 1000);

        const mr = this;
        function randomValue() {
            if (mr.single) {
                const vaccinated = mr.single['children_vaccinated'] ? mr.single['children_vaccinated']['value'] : 0;
                const target = mr.single['target_population'] ? mr.single['target_population']['value'] : 0;
                let covarage = (vaccinated * 100 / target).toFixed(1);
                covarage = isNaN(covarage) ? 0 : covarage;
                hand.showValue(parseFloat(covarage), 1000, am4core.ease.cubicOut);
                chart.setTimeout(randomValue, 2000);
            }
        }
        return chart;
    }

    @computed get opvGauge() {
        var chart = am4core.create("chartdiv", am4charts.GaugeChart);
        chart.hiddenState.properties.opacity = 0;

        chart.innerRadius = -25;

        var axis = chart.xAxes.push(new am4charts.ValueAxis());
        axis.min = 0;
        axis.max = 100;
        axis.strictMinMax = true;
        axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor("background");
        axis.renderer.grid.template.strokeOpacity = 0.3;


        var range0 = axis.axisRanges.create();
        range0.value = 0;
        range0.endValue = 50;
        range0.axisFill.fillOpacity = 1;
        range0.axisFill.fill = 'red';
        range0.axisFill.zIndex = - 1;

        var range1 = axis.axisRanges.create();
        range1.value = 50;
        range1.endValue = 80;
        range1.axisFill.fillOpacity = 1;
        range1.axisFill.fill = 'orange';
        range1.axisFill.zIndex = -1;

        var range2 = axis.axisRanges.create();
        range2.value = 80;
        range2.endValue = 95;
        range2.axisFill.fillOpacity = 1;
        range2.axisFill.fill = 'lime';
        range2.axisFill.zIndex = -1;

        var range3 = axis.axisRanges.create();
        range3.value = 95;
        range3.endValue = 100;
        range3.axisFill.fillOpacity = 1;
        range3.axisFill.fill = 'darkgreen';
        range3.axisFill.zIndex = -1;

        var hand = chart.hands.push(new am4charts.ClockHand());

        // using chart.setTimeout method as the timeout will be disposed together with a chart
        chart.setTimeout(randomValue, 1000);

        const mr = this;

        function randomValue() {
            const vaccinated = mr.singleOPV['children_vaccinated'] ? mr.singleOPV['children_vaccinated']['value'] : 0;
            const target = mr.singleOPV['target_population'] ? mr.singleOPV['target_population']['value'] : 0;
            let covarage = (vaccinated * 100 / target).toFixed(1);
            covarage = isNaN(covarage) ? 0 : covarage;
            hand.showValue(parseFloat(covarage), 1000, am4core.ease.cubicOut);
            chart.setTimeout(randomValue, 2000);
        }
        return chart;
    }
}