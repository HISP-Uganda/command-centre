import { action, computed, observable } from 'mobx';
import socketClient from 'socket.io-client';
import axios from 'axios';
import { isEmpty, fromPairs } from 'lodash';
// import mapData from './mapData';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import shortid from 'shortid';

// import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { mrTargets, opvTargets } from './Targets'

am4core.useTheme(am4themes_animated);
const url = 'https://mrengine.hispuganda.org';
// const url = 'http://localhost:3001';
const socket = socketClient(url);


const findDay = (val) => {
    if (val === 'ZpyTYdeiDkA') {
        return 'Day 1'
    } else if (val === 'aEqdGN2HOLQ') {
        return 'Day 2';
    } else if (val === 'WybnHDOJacu') {
        return 'Day 3';
    } else if (val === 'UK2et7FhfIq') {
        return 'Day 4';
    } else if (val === 'jRUmp92Y4bE') {
        return 'Day 5';
    } else if (val === 'ixtIbhR0XdG') {
        return 'Day 6';
    } else if (val === 'c7HMdHJ9R1C') {
        return 'Day 7';
    } else {
        return 'Other Days'
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
    @observable opvMapData;
    @observable mrMapData;
    @observable mapSearch = 'Subcounty';
    @observable currentMapSearch;
    @observable currentOPVTarget = 0;
    @observable currentMRTarget = 0;

    @observable opvTableData;
    @observable mrTableData;

    @observable cumulativeOPVTableData;
    @observable cumulativeMRTableData;

    @observable opvSummaryData;
    @observable mrSummaryData;
    @observable loading = true;
    @observable currentSelected;

    @observable currentTargets = {};

    @observable currentSingleTarget = {
        Population: 0,
        MRTargetPopulation: 0,
        OPVTargetPopulation: 0,
        SubCounties: 0,
        Posts: 0,
        TownCouncils: 0,
        Schools: 0
    };

    @observable posts = 0;

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
        const api = this.d2.Api.getApi();
        this.currentValue = val.id;
        this.currentSelected = val;

        const level = val.path.split('/').length - 1;
        if (level === 1) {
            this.currentSearch = 'national';
        } else if (level === 2) {
            this.currentSearch = 'regions';
        } else if (level === 3) {
            this.currentSearch = 'districts';
            this.currentOPVTarget = opvTargets.filter(op => op.ou === val.id).reduce((a, b) => a + b.value, 0);
            this.currentMRTarget = mrTargets.filter(op => op.ou === val.id).reduce((a, b) => a + b.value, 0)
        } else if (level === 4) {
            this.currentSearch = 'subcounties'
        }

        const { children } = await api.get('organisationUnits/' + this.currentValue, { fields: 'children[id,name]' });
        this.currentUnits = fromPairs(children.map(child => [child.id, String(child.name).trim()]));

        await this.fetchData();

    };

    processSummary = (buckets, summary, units, targets, isMR = true) => {
        let currentSummaryData = [];
        let currentTableData = [];
        let cumulative = [];


        buckets.forEach(({ days, ...rest }) => {
            const dayData = days.buckets.map(b => {
                const numerator = parseInt(b['children_vaccinated']['value'], 10);
                const target = parseInt(b['target_population']['value'], 10);
                const vials = parseInt(b['no_vaccine_vials_issued']['value'], 10);
                const returned = parseInt(b['no_vaccine_vials_returned_unopened']['value'], 10);
                const workers = parseInt(b['number_health_workers']['value']);

                let bossTarget = 0;
                if (targets[rest.key] && isMR) {
                    bossTarget = targets[rest.key].MRTargetPopulation
                } else if (targets[rest.key] && !isMR) {
                    bossTarget = targets[rest.key].OPVTargetPopulation
                }


                let workload = workers !== 0 ? (numerator / workers).toFixed(0) : 0;
                const coverage = target !== 0 ? (numerator * 100 / target).toFixed(1) : 0
                const expected = (vials - returned) * (isMR ? 10 : 20);
                let wastage = 100 * (expected - numerator) / expected;

                const bossCoverage = bossTarget !== 0 ? (100 * numerator / bossTarget).toFixed(1) : 0

                return {
                    ...b,
                    ou: units[rest.key],
                    day: findDay(b.key),
                    id: shortid.generate(),
                    wastage: `${wastage.toFixed(1)}%`,
                    workload,
                    coverage: `${coverage}%`,
                    target,
                    bossTarget,
                    bossCoverage: `${bossCoverage}%`
                }
            });
            currentTableData = [...currentTableData, ...dayData]
        });

        const summrized = summary.map(d => {
            const numerator = parseInt(d['children_vaccinated']['value'], 10);

            const vials = parseInt(d['no_vaccine_vials_issued']['value'], 10);
            const returned = parseInt(d['no_vaccine_vials_returned_unopened']['value'], 10);
            const workers = parseInt(d['number_health_workers']['value']);

            const expected = (vials - returned) * (isMR ? 10 : 20);

            let bossTarget = 0;

            if (targets[d.key] && isMR) {
                bossTarget = targets[d.key].MRTargetPopulation
            } else if (targets[d.key] && !isMR) {
                bossTarget = targets[d.key].OPVTargetPopulation
            }
            const bossCoverage = bossTarget !== 0 ? (100 * numerator / bossTarget) : 0
            let workload = workers !== 0 ? (numerator / workers).toFixed(0) : 0;
            let wastage = 100 * (expected - numerator) / expected;
            let target = mrTargets.filter(op => op.ou === d.key).reduce((a, b) => a + b.value, 0);

            if (target === 0) {
                target = opvTargets.filter(op => op.ou === d.key).reduce((a, b) => a + b.value, 0)
            }

            const coverage = target !== 0 ? (numerator * 100 / target).toFixed(1) : 0

            cumulative = [...cumulative, { ...d, ou: units[d.key], target, bossTarget, bossCoverage, coverage: `${coverage}%`, workload, wastage: `${wastage.toFixed(1)}%`, day: 'ALL', id: shortid.generate() }]

            return [d.key, bossCoverage];
        });
        currentSummaryData = [...currentSummaryData, ...summrized]
        return { currentSummaryData, currentTableData, cumulative }
    }

    fetchRegionalDistricts = async (units, targets, what = '') => {
        const mrMapUrls = this.summary.map(d => {
            const h = `${url}${what}?type=${this.currentMapSearch}&search=${d.key}`;
            return axios.get(h)
        });
        const isMR = what === '';

        const mr = await Promise.all(mrMapUrls);
        let summaryData = [];
        let tableData = [];
        let cumulativeSummary = []

        mr.forEach((response, i) => {
            const { data: { aggregations: { data: { buckets }, summary: { buckets: summary } } } } = response;
            let { currentSummaryData, currentTableData, cumulative } = this.processSummary(buckets, summary, units, targets, isMR);
            summaryData = [...summaryData, ...currentSummaryData];
            tableData = [...tableData, ...currentTableData];
            cumulativeSummary = [...cumulativeSummary, ...cumulative]
        });

        return {
            summaryData,
            tableData,
            cumulativeSummary
        }
    }

    @action
    fetchData = async () => {
        const api = this.d2.Api.getApi();

        this.loading = true;

        try {
            const { data: { aggregations: { data: { buckets }, overall: { buckets: daily }, single, summary: { buckets: summary } } } } = await axios.get(this.currentUrl);
            this.data = buckets;
            this.daily = daily
            this.summary = summary
            this.single = single

            const { data: { aggregations: { data: { buckets: opvData }, overall: { buckets: dailyOPV }, single: singleOPV, summary: { buckets: opvSummary } } } } = await axios.get(this.currentOPVUrl);
            this.opvData = opvData;
            this.dailyOPV = dailyOPV;
            this.opvSummary = opvSummary;
            this.singleOPV = singleOPV;

            if (this.currentSearch === 'national') {
                const { data: { region, regional, districts } } = await axios.get(`${url}/targets`);
                this.currentOPVTarget = region.OPVTargetPopulation;
                this.currentMRTarget = region.MRTargetPopulation;
                this.posts = region.Posts + region.Schools
                this.currentTargets = regional;
                this.currentSingleTarget = region;
                this.mapSearch = 'District18';
                this.currentMapSearch = 'regions';
                const { organisationUnits } = await api.get('organisationUnits', { fields: 'id,name', level: 3, paging: false });
                const units = fromPairs(organisationUnits.map(child => [child.id, String(child.name).trim()]));
                const { summaryData, tableData, cumulativeSummary } = await this.fetchRegionalDistricts(units, districts);
                const { summaryData: opvSummaryData, tableData: opvTableData, cumulativeSummary: opvCumulative } = await this.fetchRegionalDistricts(units, districts, '/opv');
                this.opvTableData = opvTableData;
                this.mrTableData = tableData;
                this.opvSummaryData = opvSummaryData;
                this.mrSummaryData = summaryData;
                this.cumulativeMRTableData = cumulativeSummary;
                this.cumulativeOPVTableData = opvCumulative;
                const { data: mapData } = await axios.get(`${url}/country`);
                this.mapData = mapData;

            } else {
                if (this.currentSearch && this.currentSearch === 'districts') {
                    const { data: map } = await axios.get(`${url}/uganda?search=${this.currentValue}`);
                    const { data: { district, subCounties } } = await axios.get(`${url}/districtTargets?search=${this.currentValue}`);

                    const { currentSummaryData, currentTableData, cumulative } = this.processSummary(buckets, summary, this.currentUnits, subCounties);
                    const { currentSummaryData: currentOPVSummaryData, currentTableData: currentOPVTableData, cumulative: opvCumulative } = this.processSummary(buckets, summary, this.currentUnits, subCounties);

                    this.opvTableData = currentOPVTableData;
                    this.mrTableData = currentTableData;
                    this.opvSummaryData = currentOPVSummaryData;
                    this.mrSummaryData = currentSummaryData
                    this.cumulativeMRTableData = cumulative;
                    this.cumulativeOPVTableData = opvCumulative;

                    this.mapData = map;
                    this.currentOPVTarget = district.OPVTargetPopulation;
                    this.currentMRTarget = district.MRTargetPopulation;
                    this.posts = district.Posts + district.Schools;
                    this.currentSingleTarget = district;
                    this.currentTargets = subCounties;
                } else if (this.currentSearch && this.currentSearch === 'regions') {
                    const { data: { region, districts } } = await axios.get(`${url}/regionalTargets?search=${this.currentValue}`);
                    const { data: map } = await axios.get(`${url}/regions?search=${this.currentValue}`);

                    const { currentSummaryData, currentTableData, cumulative } = this.processSummary(buckets, summary, this.currentUnits, districts);
                    const { currentSummaryData: currentOPVSummaryData, currentTableData: currentOPVTableData, cumulative: opvCumulative } = this.processSummary(buckets, summary, this.currentUnits, districts);

                    this.opvTableData = currentOPVTableData;
                    this.mrTableData = currentTableData;
                    this.opvSummaryData = currentOPVSummaryData;
                    this.mrSummaryData = currentSummaryData
                    this.cumulativeMRTableData = cumulative;
                    this.cumulativeOPVTableData = opvCumulative;

                    this.currentOPVTarget = region.OPVTargetPopulation;
                    this.currentMRTarget = region.MRTargetPopulation;
                    this.posts = region.Posts + region.Schools;;
                    this.currentSingleTarget = region;
                    this.currentTargets = districts;
                    this.mapData = map;
                } else if (this.currentSearch && this.currentSearch === 'subcounties') {
                    // const { data: targets } = await axios.get(`${url}/regionalTargets?search=${this.currentValue}`);
                    // const { data: map } = await axios.get(`${url}/regions?search=${this.currentValue}`);
                    // this.currentOPVTarget = targets.OPVTargetPopulation;
                    // this.currentMRTarget = targets.MRTargetPopulation;
                    // this.posts = targets.Posts
                    // this.mapData = map;
                }
            }
        } catch (error) {
            console.log(error)
        }
        this.loading = false;
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
            const day = findDay(d.key);
            let target = 0;
            if (day <= 'Day 3') {
                target = Math.ceil(this.currentSingleTarget.MRTargetPopulation * 0.8 / 3)
            } else if (day > 'Day 3') {
                target = Math.ceil(this.currentSingleTarget.MRTargetPopulation * 0.1)
            }
            return {
                y: target,
                name: day
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
                data: target.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }, {
                name: 'Vaccinated',
                data: vaccinated.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }]
        }
    }

    @computed
    get vaccinatedOPV() {

        let vaccinated = this.dailyOPV.map(d => {
            return {
                y: d['children_vaccinated']['value'],
                name: findDay(d.key)

            }
        });

        let target = this.dailyOPV.map(d => {
            const day = findDay(d.key);
            let target = 0;
            if (day <= 'Day 3') {
                target = Math.ceil(this.currentSingleTarget.OPVTargetPopulation * 0.8 / 3)
            } else if (day > 'Day 3') {
                target = Math.ceil(this.currentSingleTarget.OPVTargetPopulation * 0.1)
            }
            return {
                y: target,
                name: day
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
                data: target.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }, {
                name: 'Vaccinated',
                data: vaccinated.sort((a, b) => (a.name > b.name) ? 1 : -1)
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

                const current = this.currentTargets[d.key];
                let currentTarget = 0;
                if (current) {
                    currentTarget = current.MRTargetPopulation;
                }
                return {
                    y: currentTarget,
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
                const current = this.currentTargets[d.key];
                let currentTarget = 0;
                if (current) {
                    currentTarget = current.OPVTargetPopulation;
                }
                return {
                    y: currentTarget,
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
                y: d['no_vials_discarded_other_factors']['value'],
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
                name: 'Other Factors',
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
                y: d['no_vials_discarded_other_factors']['value'],
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
                name: 'Other Factors',
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
                y: d['no_vials_discarded_other_factors']['value'],
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
                data: contamination.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }, {
                name: 'Partially Used',
                data: partial.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }, {
                name: 'Changed Color',
                data: changed.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }, {
                name: 'Other Factors',
                data: unopen.sort((a, b) => (a.name > b.name) ? 1 : -1)
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
                y: d['no_vials_discarded_other_factors']['value'],
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
                data: contamination.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }, {
                name: 'Partially Used',
                data: partial.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }, {
                name: 'Changed Color',
                data: changed.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }, {
                name: 'Other Factors',
                data: unopen.sort((a, b) => (a.name > b.name) ? 1 : -1)
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
            wastage = Number(wastage.toFixed(2));
            dosage = Number(dosage.toFixed(2));
            wastage = isNaN(wastage) ? 0 : wastage
            dosage = isNaN(dosage) ? 0 : dosage
            let covarage = Number((vaccinated * 100 / target).toFixed(1));
            covarage = isNaN(covarage) ? 0 : covarage
            const obj = Object.assign({}, ...Object.keys(this.single).map(k => ({ [k]: this.single[k].value })));
            let workload = vaccinated / this.single['number_health_workers']['value']
            workload = isNaN(workload) ? 0 : workload
            return { ...obj, wastage, dosage, workload: Number(workload.toFixed(1)), covarage, used: expected }
        }
        return { wastage: 0, dosage: 0, workload: 0, covarage: 0 };
    }

    @computed
    get opvTextValues() {
        if (!isEmpty(this.singleOPV)) {
            const expected = (this.singleOPV['no_vaccine_vials_issued']['value'] - this.singleOPV['no_vaccine_vials_returned_unopened']['value']) * 20;
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
            return { ...obj, wastage, dosage, workload: workload.toFixed(1), covarage, used: expected }
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
        if (this.mapData && this.mrSummaryData) {
            return {
                chart: {
                    map: JSON.parse(JSON.stringify(this.mapData)),
                    height: '55%',
                    width: '55%'
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
                    pointFormat: `{point.properties.name}: {point.value}%`
                },

                colorAxis: {
                    tickPixelInterval: 100
                },
                series: [{
                    data: JSON.parse(JSON.stringify(this.mrSummaryData)),
                    keys: ['id', 'value'],
                    type: 'map',
                    joinBy: 'id',
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
        return {};
    }

    @computed
    get opvMap() {
        if (this.mapData && this.mrSummaryData) {
            return {
                chart: {
                    map: JSON.parse(JSON.stringify(this.mapData)),
                    height: '55%',
                    width: '55%'
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
                    pointFormat: `{point.properties.name}: {point.value}%`
                },

                colorAxis: {
                    tickPixelInterval: 100
                },
                series: [{
                    data: JSON.parse(JSON.stringify(this.opvSummaryData)),
                    keys: ['id', 'value'],
                    type: 'map',
                    joinBy: 'id',
                    name: 'Rubella (MR)',
                    states: {
                        hover: {
                            color: '#a4edba'
                        }
                    }
                }]
            }
        }
        return {};
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
            hand.showValue(parseFloat(mr.estimates), 1000, am4core.ease.cubicOut);
            chart.setTimeout(randomValue, 2000);
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
            hand.showValue(parseFloat(mr.opvEstimates), 1000, am4core.ease.cubicOut);
            chart.setTimeout(randomValue, 2000);
        }
        return chart;
    }

    @computed get estimates() {
        if (this.textValues && this.currentMRTarget !== 0) {
            const value = Number((this.textValues.children_vaccinated * 100 / this.currentMRTarget).toFixed(1));
            return isNaN(value) ? 0 : value
        }
        return 0;
    }

    @computed get opvEstimates() {
        if (this.opvTextValues && this.currentOPVTarget !== 0) {
            const value = Number((this.opvTextValues.children_vaccinated * 100 / this.currentOPVTarget).toFixed(1));
            return isNaN(value) ? 0 : value
        }
        return 0;
    }
}