import React from 'react';

import { Button } from 'antd'
import { inject, observer } from "mobx-react";



@inject('store')
@observer
class CheckList extends React.Component {
    store = null;
    chart;

    constructor(props) {
        super(props);
        const { store } = props;
        this.store = store;
    }

    componentDidMount() {
        this.store.fetchChecklist();
    }
    componentWillUnmount() {
    }

    table = () => {
        return <table id="customers">
            <thead>
                <tr>
                    <th>Checklist Item</th>
                    <th>{this.store.check.column1}</th>
                    <th>{this.store.check.column2}</th>
                    <th>Quality Score</th>
                </tr>
            </thead>
            <tbody>
                {this.store.check.dataElements.map((d, i) => <tr key={i}>
                    <td>{d.name}</td>
                    <td>{d.yes}</td>
                    <td>{d.no}</td>
                    <td>{d.score}</td>
                </tr>)}
            </tbody>
        </table>
    }

    render() {
        return (
            <div style={{ display: 'flex', height: '100%', padding: 5 }}>

                <div className="content" style={{ width: '20%', margin: 5 }}>
                    <div
                        className="headers"
                        style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
                    >
                        <div style={{ fontSize: 20, textAlign: 'center' }}>
                            SUPERVISION CHECKLIST
                        </div>
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', paddingBottom: 10 }}>
                        <Button size="large" onClick={this.store.check.setSection('esKGUJH77nT')}>COLD CHAINS</Button>
                        <Button size="large" onClick={this.store.check.setSection('yYGBoZqF4Kx')}>SUPPLIES DISTRIBUTION</Button>
                        <Button size="large" onClick={this.store.check.setSection('iANYpOenUGV')}>ADEQUATE SUPPLIES</Button>
                        <Button size="large" onClick={this.store.check.setSection('HM9gSZDIZk1')}>POST ARRANGEMENTS</Button>
                        <Button size="large" onClick={this.store.check.setSection('AYuvOmUuViB')}>MONITORING AEFI</Button>
                        <Button size="large" onClick={this.store.check.setSection('z1xS1Cx5BOv')}>PRACTICE AND SAFETY</Button>
                        <Button size="large" onClick={this.store.check.setSection('PGCnAy332M9')}>WASTAGE MANAGEMENT</Button>
                        <Button size="large" onClick={this.store.check.setSection('XdOgkS3ojox')}>SOCIAL MOBILIZATION</Button>
                        <Button size="large" onClick={this.store.check.setSection('C1e2MmhrHzi')}>MONITORING COVERAGE</Button>
                    </nav>
                </div>
                <div style={{ margin: 5, width: '80%' }} className="content">
                    <div
                        className="headers"
                        style={{ lineHeight: '48px', background: '#D9EDF7', display: 'flex', padding: 5 }}
                    >
                        <div style={{ fontSize: 20, textAlign: 'center' }}>{this.store.check.currentSection.displayName} - {this.store.selected.length > 0 ? this.store.selected[0].displayName : ''}
                        </div>
                    </div>
                    <div style={{ padding: 20 }}>
                        {this.table()}
                    </div>
                </div>
            </div>
        )
    }
}
export default CheckList