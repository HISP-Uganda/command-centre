import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import axios from 'axios';
import { units, deducePeriodType } from '../utils'

const url = 'https://mrengine.hispuganda.org';
// const url = 'http://localhost:3001';

export class Management {
    @observable d2;
    @observable section = 'w48DM92Ed48';
    @observable currentValue = 'akV6429SUqu';
    @observable currentSection = {};
    @observable data = {};
    @observable filtered = {};
    @observable column1 = 'Yes'
    @observable column2 = 'No';
    @observable currentDisplay = '';

    @observable loading = false;

    @observable selectedPeriods = [{
        id: 'THIS_YEAR', name: 'This Year'
    }];

    @observable dialogOpened = false;

    @action setDialogOpened = (val) => this.dialogOpened = val;

    @action setSelectedPeriods = (val) => {
        this.selectedPeriods = val;

    };
    @action onDeselect = (val) => {
        const toBeDeselected = val.map(v => v.id);
        const periods = this.selectedPeriods.filter(p => {
            return toBeDeselected.indexOf(p.id) === -1
        });

        this.setSelectedPeriods(periods);

    };

    @action setD2 = val => this.d2 = val;

    @action setSection = val => async () => {
        this.section = val;
        await this.fetchData();
    };

    @action setCurrentSearch = async () => {
        // this.currentValue = val;
        await this.fetchData();

    };

    @action onUpdate = async (selectedPeriods) => {
        this.setSelectedPeriods(selectedPeriods);
        this.setDialogOpened(false);
        await this.fetchData();
    };

    @action onClose = () => {
        this.setDialogOpened(false);
    };

    @action togglePeriodDialog = () => {
        this.setDialogOpened(!this.dialogOpened);
    };

    @action onReorder = () => {

    };

    @action
    fetchData = async () => {
        this.loading = true;
        const { data } = await axios.get(`${url}/management`, {
            params: { indicator: this.section, orgUnit: this.currentValue, period: this.finalPeriods }
        });

        switch (this.section) {
            case 'w48DM92Ed48':
                this.currentDisplay = 'MALARIA';
                break;
            case 'In9rCBCxByj':
                this.currentDisplay = 'MATERNAL CHILD HEALTH'
                break;
            case 'B5KvsE97qFu':
                this.currentDisplay = 'ROUTINE IMMUNIZATION'
                break;
            case 'cs3uA6FLvw3':
                this.currentDisplay = 'REPORTING'
                break;

            default:
                this.currentDisplay = ''
                break;
        }

        this.data = data;
        this.loading = false;
    }

    @computed get summaryData() {
        if (this.data.rows) {
            const data = this.data.rows.map(r => {
                return { de: this.data.metaData.items[r[0]].name, value: Number(r[3]) }
            });
            return _(data)
                .groupBy('de')
                .map((objs, key) => ({
                    'name': key,
                    'y': _.meanBy(objs, 'value').toFixed(1)
                }))
                .value();
        }
        return []
    }

    @computed get lineCharts() {

        if (this.data.rows) {


            const data = _.groupBy(this.data.rows, (i) => {
                return i[0];
            });

            const charts = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: this.currentDisplay
                },
                // subtitle: {
                //     text: this.description
                // },
                // xAxis: {
                //     categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                // },
                yAxis: {
                    title: {
                        text: 'Value'
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                }
            }

            const graphs = _.keys(data).map(k => {
                const d = data[k];

                const processed = d.map(dk => {
                    return [this.data.metaData.items[dk[1]].name, Number(dk[3])]
                });
                const categories = d.map(dk => {
                    return [this.data.metaData.items[dk[1]].name]
                });

                const xAxis = {
                    categories
                }

                return { ...charts, title: { text: `${this.data.metaData.items[k].name} (Trends)` }, xAxis, series: [{ data: processed, name: this.data.metaData.items[k].name }] }

            });

            return _.chunk(graphs, 2)
        }


        return []
    }

    @computed get description() {
        const ou = units.find(u => u.id === this.currentValue);
        const periods = this.selectedPeriods.map(p => p.id).join(',')
        return `${this.currentDisplay} ${ou.name} ${periods}`
    }

    @computed get finalPeriods() {
        return deducePeriodType(this.selectedPeriods);
    }

    @computed get columns() {
        switch (this.section) {
            case 'B5KvsE97qFu':
                return [6, 6, 4, 4, 4]
            default:
                return this.summaryData.map(s => {
                    return 24 / this.summaryData.length
                })
        };
    }
}