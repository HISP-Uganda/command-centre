import { action, computed, observable } from 'mobx';
import _ from 'lodash';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
// const url = 'https://mrengine.hispuganda.org';
const url = 'http://localhost:3001';

export class Form4MR {
    @observable d2;
    @observable currentSearch;
    @observable currentUnits = {}
    @observable currentValue;
    @observable dailyData = {};
    @observable summaryData = {};
    @observable disaggregated = {};
    @observable target = {};
    @observable childrenTargets = {};
    currentMap = null;
    @observable hasFinished = true;
    @observable level = 1;

    @action setD2 = val => this.d2 = val;

    @action setCurrentSearch = async val => {
        const api = this.d2.Api.getApi();
        this.currentValue = val.id;
        this.currentSelected = val;
        const level = val.path.split('/').length - 1;
        this.level = level;
        if (level === 1) {
            this.currentSearch = 'national';
        } else if (level === 2) {
            this.currentSearch = 'regions';
        } else if (level === 3) {
            this.currentSearch = 'districts';
            // this.currentOPVTarget = opvTargets.filter(op => op.ou === val.id).reduce((a, b) => a + b.value, 0);
            // this.currentMRTarget = mrTargets.filter(op => op.ou === val.id).reduce((a, b) => a + b.value, 0)
        } else if (level === 4) {
            this.currentSearch = 'subcounties'
        }
        const { children } = await api.get('organisationUnits/' + this.currentValue, { fields: 'children[id,name]' });
        this.currentUnits = _.fromPairs(children.map(child => [child.id, String(child.name).trim()]));
        await this.fetchData();
    };


    @action
    fetchData = async () => {
        this.hasFinished = false;
        const periods = ['20191016', '20191017', '20191018', '20191020', '20191019', '20191021', '20191022'];
        const targetPeriods = ['2019']
        const mrElements = ['oYj6mVgFf2H', 'w0cmARVOU5R', 'IJto5FYpVQj', 'YXHgULYggAk', 'JBTIv3B1o33', 'xsNReBPJlir', 'mOKgl35QkC2', 'bN9fLm3yW9P', 'Icac7PqUQkj', 'cWx5GXE1cWl', 'DRsiOLxd0pE', 'vXlet9fafzD', 'sU2sCm75JZx', 'hkVZTeoFVgE', 'NpQYSATdBKx'];
        const mrTarget = ['weXx8JbnOZZ']
        const ou = [this.currentValue];
        const children = _.keys(this.currentUnits);
        const targetRequest = new this.d2.analytics.request()
            .addDataDimension(mrTarget)
            .addPeriodFilter(targetPeriods)
            .addOrgUnitFilter(ou)
            .withAggregationType('SUM')
            .withSkipRounding(true);

        const targetRequestChildren = new this.d2.analytics.request()
            .addDataDimension(mrTarget)
            .addPeriodFilter(targetPeriods)
            .addOrgUnitDimension(children)
            .withAggregationType('SUM')
            .withSkipRounding(true);


        const req = new this.d2.analytics.request()
            .addDataDimension(mrElements)
            .addPeriodDimension(periods)
            .addOrgUnitFilter(ou)
            .withAggregationType('SUM')
            .withSkipRounding(true);

        const req2 = new this.d2.analytics.request()
            .addDataDimension(mrElements)
            .addOrgUnitDimension(children)
            .addPeriodFilter(periods)
            .withAggregationType('SUM')
            .withSkipRounding(true);


        const req3 = new this.d2.analytics.request()
            .addDataDimension(mrElements)
            .addOrgUnitFilter(ou)
            .addPeriodFilter(periods)
            .withAggregationType('SUM')
            .withSkipRounding(true);

        const allData = await Promise.all([this.d2.analytics.aggregate.get(req), this.d2.analytics.aggregate.get(req2), this.d2.analytics.aggregate.get(req3)]);
        const allTargets = await Promise.all([this.d2.analytics.aggregate.get(targetRequest), this.d2.analytics.aggregate.get(targetRequestChildren)]);

        const query = await fetch(`${url}/maps?level=${this.level}`);
        this.currentMap = await query.json();

        this.dailyData = allData[0];
        this.disaggregated = allData[1];
        this.summaryData = allData[2];
        this.target = allTargets[0];
        this.childrenTargets = allTargets[1];
        this.hasFinished = true;
    }

    @computed
    get vaccinated() {
        const elements = ['oYj6mVgFf2H', 'w0cmARVOU5R', 'IJto5FYpVQj', 'YXHgULYggAk'];

        if (this.dailyData.rows) {

            const data = this.dailyData.rows.filter(r => {
                return elements.indexOf(r[0]) !== -1;
            }).map(e => {
                return { de: e[0], pe: e[1], value: Number(e[2]) }
            });

            const vaccinated = _(data)
                .groupBy('pe')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

            const days = vaccinated.sort((a, b) => (a.name > b.name) ? 1 : -1).map((v, i) => {

                if (this.target.rows) {
                    return {
                        ...v,
                        y: i <= 2 ? Math.round(Number(this.target.rows[0][1]) * 0.8 / 3) : Math.round(Number(this.target.rows[0][1]) * 0.1)

                    }
                }
                return {
                    ...v,
                    y: 0

                }
            })
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
                    data: days.sort((a, b) => (a.name > b.name) ? 1 : -1)
                }, {
                    name: 'Vaccinated',
                    data: vaccinated.sort((a, b) => (a.name > b.name) ? 1 : -1)
                }]
            }

        }
        return {};
    }

    @computed
    get discarded() {

        if (this.dailyData.rows) {
            let contamination = this.dailyData.rows.filter(r => {
                return r[0] === 'DRsiOLxd0pE'
            }).map(e => {
                return { de: e[0], pe: e[1], value: Number(e[2]) }
            });

            let partial = this.dailyData.rows.filter(r => {
                return r[0] === 'Icac7PqUQkj'
            }).map(e => {
                return { de: e[0], pe: e[1], value: Number(e[2]) }
            });

            let changed = this.dailyData.rows.filter(r => {
                return r[0] === 'cWx5GXE1cWl'
            }).map(e => {
                return { de: e[0], pe: e[1], value: Number(e[2]) }
            });

            let other = this.dailyData.rows.filter(r => {
                return r[0] === 'vXlet9fafzD'
            }).map(e => {
                return { de: e[0], pe: e[1], value: Number(e[2]) }
            });

            contamination = _(contamination)
                .groupBy('pe')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

            other = _(other)
                .groupBy('pe')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

            partial = _(partial)
                .groupBy('pe')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

            changed = _(changed)
                .groupBy('pe')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

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
                    data: contamination.sort((a, b) => (a.name > b.name) ? 1 : -1)
                }, {
                    name: 'Partially Used',
                    data: partial.sort((a, b) => (a.name > b.name) ? 1 : -1)
                }, {
                    name: 'Changed Color',
                    data: changed.sort((a, b) => (a.name > b.name) ? 1 : -1)
                }, {
                    name: 'Other Factors',
                    data: other.sort((a, b) => (a.name > b.name) ? 1 : -1)
                }]
            }

        }
        return {};
    }

    titleCase = (string) => {
        var sentence = string.toLowerCase().split(" ");
        for (var i = 0; i < sentence.length; i++) {
            sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
        }
        return sentence.join(" ");
    }

    @computed
    get disaggregatedMap() {

        const elements = ['oYj6mVgFf2H', 'w0cmARVOU5R', 'IJto5FYpVQj', 'YXHgULYggAk'];
        if (this.disaggregated.rows) {

            let data = this.disaggregated.rows.filter(r => {
                return elements.indexOf(r[0]) !== -1;
            }).map(e => {
                return { de: e[0], ou: e[1], value: Number(e[2]) }
            });

            const vaccinated = _(data)
                .groupBy('ou')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();


            const targets = vaccinated.sort((a, b) => (a.name > b.name) ? 1 : -1).map((v, i) => {
                if (this.childrenTargets.rows) {
                    const target = this.childrenTargets.rows.find(b => v.name === b[1]);
                    if (target) {
                        return {
                            ...v,
                            y: Math.round(Number(target[2]))

                        }
                    }
                }
                return {
                    ...v,
                    y: 0
                }
            }).map(e => {
                return {
                    ...e,
                    name: this.disaggregated.metaData.items[e.name]['name']
                }
            });


            const finalVaccinated = vaccinated.map(e => {
                return {
                    ...e,
                    name: this.disaggregated.metaData.items[e.name]['name']
                }
            });

            const vals = finalVaccinated.map(v => {
                const target = targets.find(x => x.name === v.name);
                if (target) {
                    return [this.titleCase(String(v.name).replace(' (Form 4)', '')), Number(100 * v.y / target.y).toFixed(2)]
                }
                return [this.titleCase(String(v.name).replace(' (Form 4)', '')), 0]
            });

            const map = _.fromPairs(vals)

            return this.currentMap.map(mp => {
                let properties = mp.properties;
                const value = map[properties.name] || 0
                properties = { ...properties, value };
                return { ...mp, properties }
            })
        }
        return null;

    }

    @computed
    get disaggregatedData() {
        const elements = ['oYj6mVgFf2H', 'w0cmARVOU5R', 'IJto5FYpVQj', 'YXHgULYggAk'];
        if (this.disaggregated.rows) {

            let data = this.disaggregated.rows.filter(r => {
                return elements.indexOf(r[0]) !== -1;
            }).map(e => {
                return { de: e[0], ou: e[1], value: Number(e[2]) }
            });

            const vaccinated = _(data)
                .groupBy('ou')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();


            const targets = vaccinated.sort((a, b) => (a.name > b.name) ? 1 : -1).map((v, i) => {
                if (this.childrenTargets.rows) {
                    const target = this.childrenTargets.rows.find(b => v.name === b[1]);
                    if (target) {
                        return {
                            ...v,
                            y: Math.round(Number(target[2]))

                        }
                    }
                }
                return {
                    ...v,
                    y: 0

                }
            }).map(e => {
                return {
                    ...e,
                    name: this.disaggregated.metaData.items[e.name]['name']
                }
            });


            const finalVaccinated = vaccinated.map(e => {
                return {
                    ...e,
                    name: this.disaggregated.metaData.items[e.name]['name']
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
                    data: targets
                }, {
                    name: 'Vaccinated',
                    data: finalVaccinated
                }]
            }
        }

        return {};
    }

    @computed
    get disaggregatedWastage() {

        if (this.disaggregated.rows) {
            let contamination = this.disaggregated.rows.filter(r => {
                return r[0] === 'DRsiOLxd0pE'
            }).map(e => {
                return { de: e[0], ou: e[1], value: Number(e[2]) }
            });

            let partial = this.disaggregated.rows.filter(r => {
                return r[0] === 'Icac7PqUQkj'
            }).map(e => {
                return { de: e[0], ou: e[1], value: Number(e[2]) }
            });

            let changed = this.disaggregated.rows.filter(r => {
                return r[0] === 'cWx5GXE1cWl'
            }).map(e => {
                return { de: e[0], ou: e[1], value: Number(e[2]) }
            });

            let other = this.disaggregated.rows.filter(r => {
                return r[0] === 'vXlet9fafzD'
            }).map(e => {
                return { de: e[0], ou: e[1], value: Number(e[2]) }
            });

            contamination = _(contamination)
                .groupBy('ou')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

            other = _(other)
                .groupBy('ou')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

            partial = _(partial)
                .groupBy('ou')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

            changed = _(changed)
                .groupBy('ou')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.sumBy(objs, 'value')
                }))
                .value();

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
                    data: contamination.sort((a, b) => (a.name > b.name) ? 1 : -1).map(e => {
                        return {
                            ...e,
                            name: this.disaggregated.metaData.items[e.name]['name']
                        }
                    })
                }, {
                    name: 'Partially Used',
                    data: partial.sort((a, b) => (a.name > b.name) ? 1 : -1).map(e => {
                        return {
                            ...e,
                            name: this.disaggregated.metaData.items[e.name]['name']
                        }
                    })
                }, {
                    name: 'Changed Color',
                    data: changed.sort((a, b) => (a.name > b.name) ? 1 : -1).map(e => {
                        return {
                            ...e,
                            name: this.disaggregated.metaData.items[e.name]['name']
                        }
                    })
                }, {
                    name: 'Other Factors',
                    data: other.sort((a, b) => (a.name > b.name) ? 1 : -1).map(e => {
                        return {
                            ...e,
                            name: this.disaggregated.metaData.items[e.name]['name']
                        }
                    })
                }]
            }

        }
        return {};
    }

    @computed
    get textValues() {
        const elements = ['oYj6mVgFf2H', 'w0cmARVOU5R', 'IJto5FYpVQj', 'YXHgULYggAk'];
        if (this.summaryData.rows) {
            const data = this.summaryData.rows.filter(r => {
                return elements.indexOf(r[0]) !== -1;
            }).map(e => {
                return Number(e[1])
            });

            const issued = this.summaryData.rows.find(r => {
                return r[0] === 'sU2sCm75JZx';
            });

            const unopened = this.summaryData.rows.find(r => {
                return r[0] === 'hkVZTeoFVgE';
            });
            const workers = this.summaryData.rows.find(r => {
                return r[0] === 'JBTIv3B1o33';
            });


            let contamination = this.summaryData.rows.find(r => {
                return r[0] === 'DRsiOLxd0pE'
            })

            let partial = this.summaryData.rows.find(r => {
                return r[0] === 'Icac7PqUQkj'
            })

            let changed = this.summaryData.rows.find(r => {
                return r[0] === 'cWx5GXE1cWl'
            })

            let other = this.summaryData.rows.find(r => {
                return r[0] === 'vXlet9fafzD'
            });

            let discarded = 0;

            let expected = 0;
            let dosesIssued = 0;
            let wastage = 0;
            let workload = 0;
            let healthWorkers = 0;




            const finalTarget = this.target.rows && this.target.rows.length > 0 ? Number(this.target.rows[0][1]) : 0;
            const vaccinated = _.sum(data);

            if (issued && unopened) {
                dosesIssued = Number(issued[1])
                expected = (dosesIssued - Number(unopened[1])) * 10;
                wastage = Number((100 * (expected - vaccinated) / expected).toFixed(1));
            }

            if (workers) {
                healthWorkers = Number(workers[1]);
                workload = Number((vaccinated / healthWorkers).toFixed(1));
            }

            let ubosCoverage = 0;
            if (finalTarget !== 0) {
                ubosCoverage = Number((100 * vaccinated / finalTarget).toFixed(1))
            }

            if (contamination) {
                discarded = Number(contamination[1]) + discarded

            }

            if (partial) {
                discarded = Number(partial[1]) + discarded

            }
            if (changed) {
                discarded = Number(changed[1]) + discarded

            }
            if (other) {
                discarded = Number(other[1]) + discarded

            }

            return {
                ubosTarget: finalTarget.toLocaleString(),
                districtTarget: 0,
                healthWorkers: healthWorkers.toLocaleString(),
                vaccinated,
                ubosCoverage,
                districtCoverage: 0,
                dosesIssued: (dosesIssued * 10).toLocaleString(),
                dosesUsed: Number(expected).toLocaleString(),
                dosesDiscarded: (discarded * 10).toLocaleString(),
                workload,
                wastage,
            }
        }

        return {
            ubosTarget: 0,
            districtTarget: 0,
            healthWorkers: 0,
            vaccinated: 0,
            ubosCoverage: 0,
            districtCoverage: 0,
            dosesIssued: 0,
            dosesUsed: 0,
            dosesDiscarded: 0,
            workload: 0,
            wastage: 0,
        }
    }


    @computed
    get wastageGraph() {
        if (this.summaryData.rows) {

            let contamination = this.summaryData.rows.find(r => {
                return r[0] === 'DRsiOLxd0pE'
            });

            let partial = this.summaryData.rows.find(r => {
                return r[0] === 'Icac7PqUQkj'
            });

            let changed = this.summaryData.rows.find(r => {
                return r[0] === 'cWx5GXE1cWl'
            });

            let other = this.summaryData.rows.find(r => {
                return r[0] === 'vXlet9fafzD'
            });

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
                        partial ? Number(partial[1]) : 0,
                        contamination ? Number(contamination[1]) : 0,
                        changed ? Number(changed[1]) : 0,
                        other ? Number(other[1]) : 0
                    ]
                }]
            }
        }
        return {}
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

        const form4 = this;
        function randomValue() {
            hand.showValue(parseFloat(form4.textValues.ubosCoverage), 1000, am4core.ease.cubicOut);
            chart.setTimeout(randomValue, 2000);
        }
        return chart;
    }

}