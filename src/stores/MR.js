import { action, computed, observable } from 'mobx';
import socketClient from 'socket.io-client';
import axios from 'axios';
import { isEmpty, fromPairs } from 'lodash';
import mapData from './mapData';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

// import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);
// const url = 'https://mrengine.hispuganda.org';
const url = 'http://localhost:3001';
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
            this.currentSearch = 'regions'
        } else if (level === 3) {
            this.currentSearch = 'districts'
        } else if (level === 4) {
            this.currentSearch = 'subcounties'
        }

        const api = this.d2.Api.getApi();

        const { children } = await api.get('organisationUnits/' + val.id, { fields: 'children[id,name]' });

        this.currentUnits = fromPairs(children.map(child => [String(child.id).toLowerCase(), child.name]));

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


            const { data: { aggregations: { data: { buckets:opvData }, overall: { buckets: dailyOPV }, single:singleOPV, summary: { buckets: opvSummary } } } } = await axios.get(this.currentOPVUrl);
            this.opvData = opvData;
            this.dailyOPV = dailyOPV
            this.opvSummary = opvSummary
            this.singleOPV = singleOPV

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
        return url;
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
            return {
                y: d['target_population']['value'],
                name: findDay(d.key)
            }
        });

        let wastage = this.daily.map(d => {
            return {
                y: d['no_vials_discarded']['value'],
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
                name: 'Vaccinated',
                data: vaccinated
            }, {
                name: 'Target',
                data: target
            }, {
                name: 'Wastage',
                data: wastage
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

        let wastage = this.dailyOPV.map(d => {
            return {
                y: d['no_vials_discarded']['value'],
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
                name: 'Vaccinated',
                data: vaccinated
            }, {
                name: 'Target',
                data: target
            }, {
                name: 'Wastage',
                data: wastage
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
                    name: 'Vaccinated',
                    data: vaccinated
                }, {
                    name: 'Target',
                    data: target
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
                    name: 'Vaccinated',
                    data: vaccinated
                }, {
                    name: 'Target',
                    data: target
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
            console.log(target)
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
        return {
            title: {
                text: ''
            },
            colorAxis: {
                min: 0
            },
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            series: [{
                mapData: mapData,
                // dataLabels: {
                //     formatter: function () {
                //         return this.point.properties['woe-label'].split(',')[0];
                //     }
                // },
                name: 'Uganda',
                data: [
                    ['ug-2595', 0],
                    ['ug-7073', 1],
                    ['ug-7074', 2],
                    ['ug-7075', 3],
                    ['ug-2785', 4],
                    ['ug-2791', 5],
                    ['ug-3385', 6],
                    ['ug-3388', 100],
                    ['ug-2786', 8],
                    ['ug-7056', 9],
                    ['ug-7083', 10],
                    ['ug-7084', 11],
                    ['ug-7058', 12],
                    ['ug-1678', 13],
                    ['ug-1682', 14],
                    ['ug-1683', 15],
                    ['ug-1685', 16],
                    ['ug-7051', 17],
                    ['ug-2762', 18],
                    ['ug-2767', 19],
                    ['ug-2777', 20],
                    ['ug-2778', 21],
                    ['ug-2780', 22],
                    ['ug-2781', 23],
                    ['ug-2782', 24],
                    ['ug-2783', 25],
                    ['ug-2779', 26],
                    ['ug-2784', 27],
                    ['ug-3382', 28],
                    ['ug-3384', 29],
                    ['ug-3389', 30],
                    ['ug-3383', 31],
                    ['ug-3390', 32],
                    ['ug-3386', 33],
                    ['ug-3391', 34],
                    ['ug-3392', 35],
                    ['ug-3394', 36],
                    ['ug-2750', 37],
                    ['ug-7048', 38],
                    ['ug-7080', 39],
                    ['ug-7081', 40],
                    ['ug-1684', 41],
                    ['ug-7082', 42],
                    ['ug-1688', 43],
                    ['ug-7079', 44],
                    ['ug-7068', 45],
                    ['ug-7070', 46],
                    ['ug-7049', 47],
                    ['ug-2787', 48],
                    ['ug-7055', 49],
                    ['ug-2769', 50],
                    ['ug-7052', 51],
                    ['ug-2774', 52],
                    ['ug-7059', 53],
                    ['ug-7060', 54],
                    ['ug-7057', 55],
                    ['ug-2790', 56],
                    ['ug-2776', 57],
                    ['ug-7067', 58],
                    ['ug-7065', 59],
                    ['ug-7066', 60],
                    ['ug-7069', 61],
                    ['ug-7061', 62],
                    ['ug-7063', 63],
                    ['ug-7062', 64],
                    ['ug-7064', 65],
                    ['ug-7086', 66],
                    ['ug-2744', 67],
                    ['ug-1679', 68],
                    ['ug-1680', 69],
                    ['ug-7054', 70],
                    ['ug-1686', 71],
                    ['ug-7078', 72],
                    ['ug-1677', 73],
                    ['ug-1690', 74],
                    ['ug-2745', 75],
                    ['ug-2752', 76],
                    ['ug-2754', 77],
                    ['ug-1687', 78],
                    ['ug-2757', 79],
                    ['ug-1689', 80],
                    ['ug-2760', 81],
                    ['ug-2761', 82],
                    ['ug-2766', 83],
                    ['ug-2765', 84],
                    ['ug-2764', 85],
                    ['ug-2749', 86],
                    ['ug-2768', 87],
                    ['ug-2763', 88],
                    ['ug-2748', 89],
                    ['ug-2771', 90],
                    ['ug-2772', 91],
                    ['ug-2775', 92],
                    ['ug-2788', 93],
                    ['ug-2789', 94],
                    ['ug-3381', 95],
                    ['ug-3387', 96],
                    ['ug-3393', 97],
                    ['ug-7076', 98],
                    ['ug-1681', 99],
                    ['ug-2746', 100],
                    ['ug-2747', 101],
                    ['ug-2751', 102],
                    ['ug-2758', 103],
                    ['ug-2759', 104],
                    ['ug-2756', 105],
                    ['ug-2770', 106],
                    ['ug-7072', 107],
                    ['ug-7053', 108],
                    ['ug-2753', 109],
                    ['ug-2755', 110],
                    ['ug-2773', 1000]]
            }]
        }
    }

    @computed
    get opvMap() {
        return {
            title: {
                text: ''
            },
            colorAxis: {
                min: 0
            },
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            series: [{
                mapData: mapData,
                // dataLabels: {
                //     formatter: function () {
                //         return this.point.properties['woe-label'].split(',')[0];
                //     }
                // },
                name: 'Uganda',
                data: [
                    ['ug-2595', 0],
                    ['ug-7073', 1],
                    ['ug-7074', 2],
                    ['ug-7075', 3],
                    ['ug-2785', 4],
                    ['ug-2791', 5],
                    ['ug-3385', 6],
                    ['ug-3388', 100],
                    ['ug-2786', 8],
                    ['ug-7056', 9],
                    ['ug-7083', 10],
                    ['ug-7084', 11],
                    ['ug-7058', 12],
                    ['ug-1678', 13],
                    ['ug-1682', 14],
                    ['ug-1683', 15],
                    ['ug-1685', 16],
                    ['ug-7051', 17],
                    ['ug-2762', 18],
                    ['ug-2767', 19],
                    ['ug-2777', 20],
                    ['ug-2778', 21],
                    ['ug-2780', 22],
                    ['ug-2781', 23],
                    ['ug-2782', 24],
                    ['ug-2783', 25],
                    ['ug-2779', 26],
                    ['ug-2784', 27],
                    ['ug-3382', 28],
                    ['ug-3384', 29],
                    ['ug-3389', 30],
                    ['ug-3383', 31],
                    ['ug-3390', 32],
                    ['ug-3386', 33],
                    ['ug-3391', 34],
                    ['ug-3392', 35],
                    ['ug-3394', 36],
                    ['ug-2750', 37],
                    ['ug-7048', 38],
                    ['ug-7080', 39],
                    ['ug-7081', 40],
                    ['ug-1684', 41],
                    ['ug-7082', 42],
                    ['ug-1688', 43],
                    ['ug-7079', 44],
                    ['ug-7068', 45],
                    ['ug-7070', 46],
                    ['ug-7049', 47],
                    ['ug-2787', 48],
                    ['ug-7055', 49],
                    ['ug-2769', 50],
                    ['ug-7052', 51],
                    ['ug-2774', 52],
                    ['ug-7059', 53],
                    ['ug-7060', 54],
                    ['ug-7057', 55],
                    ['ug-2790', 56],
                    ['ug-2776', 57],
                    ['ug-7067', 58],
                    ['ug-7065', 59],
                    ['ug-7066', 60],
                    ['ug-7069', 61],
                    ['ug-7061', 62],
                    ['ug-7063', 63],
                    ['ug-7062', 64],
                    ['ug-7064', 65],
                    ['ug-7086', 66],
                    ['ug-2744', 67],
                    ['ug-1679', 68],
                    ['ug-1680', 69],
                    ['ug-7054', 70],
                    ['ug-1686', 71],
                    ['ug-7078', 72],
                    ['ug-1677', 73],
                    ['ug-1690', 74],
                    ['ug-2745', 75],
                    ['ug-2752', 76],
                    ['ug-2754', 77],
                    ['ug-1687', 78],
                    ['ug-2757', 79],
                    ['ug-1689', 80],
                    ['ug-2760', 81],
                    ['ug-2761', 82],
                    ['ug-2766', 83],
                    ['ug-2765', 84],
                    ['ug-2764', 85],
                    ['ug-2749', 86],
                    ['ug-2768', 87],
                    ['ug-2763', 88],
                    ['ug-2748', 89],
                    ['ug-2771', 90],
                    ['ug-2772', 91],
                    ['ug-2775', 92],
                    ['ug-2788', 93],
                    ['ug-2789', 94],
                    ['ug-3381', 95],
                    ['ug-3387', 96],
                    ['ug-3393', 97],
                    ['ug-7076', 98],
                    ['ug-1681', 99],
                    ['ug-2746', 100],
                    ['ug-2747', 101],
                    ['ug-2751', 102],
                    ['ug-2758', 103],
                    ['ug-2759', 104],
                    ['ug-2756', 105],
                    ['ug-2770', 106],
                    ['ug-7072', 107],
                    ['ug-7053', 108],
                    ['ug-2753', 109],
                    ['ug-2755', 110],
                    ['ug-2773', 1000]]
            }]
        }
    }

    @computed get gauge() {
        let chart = am4core.create("chartdiv", am4charts.GaugeChart);
        chart.innerRadius = am4core.percent(82);
        var axis = chart.xAxes.push(new am4charts.ValueAxis());
        axis.min = 0;
        axis.max = 100;
        axis.strictMinMax = true;
        axis.renderer.radius = am4core.percent(80);
        axis.renderer.inside = true;
        axis.renderer.line.strokeOpacity = 1;
        axis.renderer.ticks.template.strokeOpacity = 1;
        axis.renderer.ticks.template.length = 10;
        axis.renderer.grid.template.disabled = true;
        axis.renderer.labels.template.radius = 40;
        axis.renderer.labels.template.adapter.add("text", function (text) {
            return text + "%";
        })


        var colorSet = new am4core.ColorSet();

        var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
        axis2.min = 0;
        axis2.max = 100;
        axis2.renderer.innerRadius = 10
        axis2.strictMinMax = true;
        axis2.renderer.labels.template.disabled = true;
        axis2.renderer.ticks.template.disabled = true;
        axis2.renderer.grid.template.disabled = true;

        var range0 = axis2.axisRanges.create();
        range0.value = 0;
        range0.endValue = 50;
        range0.axisFill.fillOpacity = 1;
        range0.axisFill.fill = colorSet.getIndex(0);

        var range1 = axis2.axisRanges.create();
        range1.value = 50;
        range1.endValue = 100;
        range1.axisFill.fillOpacity = 1;
        range1.axisFill.fill = colorSet.getIndex(2);

        /**
         * Label
         */

        var label = chart.radarContainer.createChild(am4core.Label);
        label.isMeasured = false;
        label.fontSize = 45;
        label.x = am4core.percent(50);
        label.y = am4core.percent(100);
        label.horizontalCenter = "middle";
        label.verticalCenter = "bottom";
        label.text = "50%";


        /**
         * Hand
         */

        var hand = chart.hands.push(new am4charts.ClockHand());
        hand.axis = axis2;
        hand.innerRadius = am4core.percent(20);
        hand.startWidth = 10;
        hand.pin.disabled = true;
        hand.value = 50;

        hand.events.on("propertychanged", function (ev) {
            range0.endValue = ev.target.value;
            range1.value = ev.target.value;
            axis2.invalidate();
        });
        setInterval(() => {
            let value = this.store.MR.textValues.covarage;
            value = isNaN(value) ? 0 : value
            label.text = value + "%";
            new am4core.Animation(hand, {
                property: "value",
                to: value
            }).start();
        }, 2000);

        // const store = this.store;

        // setInterval(function () {
        //     let value = (store.MR.textValues.children_vaccinated * 100 / store.MR.textValues.target_population).toFixed(1) >= 100 ? 100 : (store.MR.textValues.children_vaccinated * 100 / store.MR.textValues.target_population).toFixed(1);
        //     value = isNaN(value) ? 0 : value
        //     label.text = value + "%";
        //     new am4core.Animation(hand, {
        //         property: "value",
        //         to: value
        //     }, 1000, am4core.ease.cubicOut).start();
        // }, 2000);

        return chart;
    }
}