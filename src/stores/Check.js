import { action, computed, observable } from 'mobx';
import { countBy, sumBy } from 'lodash';
export class Check {
    @observable d2;
    @observable section = 'esKGUJH77nT';
    @observable currentValue;
    @observable currentSection = {};
    @observable data = [];
    @observable column1 = 'Yes'
    @observable column2 = 'No'

    @action setD2 = val => this.d2 = val;

    @action setSection = val => async () => {
        this.section = val;
        await this.fetchData();
    };

    @action setCurrentSearch = async val => {
        this.currentValue = val.id;
        await this.fetchData();

    };

    @action
    fetchData = async () => {
        const api = this.d2.Api.getApi();
        const sections = await api.get(`programStageSections/${this.section}`, { fields: 'id,name,displayName,dataElements[id,name]' });

        this.currentSection = sections;
        const dataElement = this.currentSection.dataElements.map(e => e.id).join(',')

        const data = await api.get('events/query.json', { programStage: 'bM0OpbwpPbW', orgUnit: this.currentValue, ouMode: 'DESCENDANTS', dataElement });

        const headers = data.headers.map(h => h['name']);
        this.data = data.rows.map(r => {
            return Object.assign.apply({}, headers.map((v, i) => ({
                [v]: r[i]
            })));
        });

        this.column1 = 'Required';
        this.column2 = 'Availed'
    }

    @computed get dataElements() {
        if (this.currentSection.dataElements) {
            if (this.section === 'yYGBoZqF4Kx') {
                return [
                    ['43. #', '56. #'],
                    ['44. #', '57. #'],
                    ['45. #', '58. #'],
                    ['46. #', '59. #'],
                    ['47. #', '60. #'],
                    ['48. #', '61. #'],
                    ['49. #', '62. #'],
                    ['50. #', '63. #'],
                    ['51. #', '64. #'],
                    ['52. #', '65. #'],
                    ['53. #', '66. #'],
                    ['54. #', '67. #'],
                    ['55. #', '68. #'],
                ].map(e => {
                    const required = this.currentSection.dataElements.find(element => {
                        const test = String(element.name).includes(e[0]);
                        return test;
                    });

                    const availed = this.currentSection.dataElements.find(element => {
                        const test = String(element.name).includes(e[1]);
                        return test;
                    });

                    if (required && availed) {
                        const filtered = this.data.map(f => {
                            return { r: Number(f[required.id]), a: Number(f[availed.id]) }
                        });

                        const s1 = sumBy(filtered, 'r') || 0

                        const s2 = sumBy(filtered, 'a') || 0

                        let percentage = 0

                        if (s1 !== 0 && s2 !== 0) {
                            percentage = Number(100 * s2 / s1).toFixed(1)
                        }

                        return { ...required, name: required.name.replace(' Required', '').slice(4), yes: s1, no: s2, score: percentage };
                    }
                    return null
                }).filter(e => e !== null)
            } else {
                return this.currentSection.dataElements.map(de => {

                    const filtered = this.data.map(f => {
                        return f[de.id]
                    });

                    let percentage = 0
                    const counted = countBy(filtered);
                    if (!counted['false'] && counted['true'] !== 0) {
                        percentage = 100
                    } else if (counted['false'] !== 0 && counted['true'] !== 0) {
                        percentage = Number(100 * counted['true'] / counted['false']).toFixed(1);
                    }

                    return {
                        ...de,
                        yes: counted['true'] || 0,
                        no: counted['false'] || 0,
                        score: percentage
                    }
                });
            }
        }

        return [];
    }
}