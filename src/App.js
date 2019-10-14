import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';
import logo from './images/image.png';
import { inject, observer } from "mobx-react";
import { Router, Link } from "@reach/router";
import MRDashboard from './components/MRDashboard';
import OPVDashboard from './components/OPVDashboard';
import CheckList from './components/CheckList';

import { LocationProvider, createHistory } from '@reach/router';
import { createHashSource } from "reach-router-hash-history";

const history = createHistory(createHashSource());

const { Header, Content, Footer } = Layout;
@inject('store')
@observer
class App extends Component {
    render() {
        const { d2 } = this.props
        return (
            <LocationProvider history={history}>
                <Layout className="layout" style={{ width: '100vw', height: '100vh' }}>
                    <Header style={{ background: '#000066', display: 'flex', padding: 0 }}>
                        <div className="logo" style={{ width: 120, textAlign: 'center', height: 42 }}>
                            <img src={logo} alt="Logo" height="56" />
                        </div>
                        <Menu
                            mode="horizontal"
                            defaultSelectedKeys={['2']}
                            style={{ lineHeight: '64px', background: '#000066', display: 'flex', marginRight: 'auto' }}
                        >
                            <Menu.Item key="1" className="modified-item" style={{ background: '#95CEFF', width: 210, color: 'white' }}>
                                <Link to="/">MEASLES RUBELLA (MR)</Link>
                            </Menu.Item>
                            <Menu.Item key="2" className="modified-item" style={{ background: '#95CEFF', marginLeft: 2, width: 210, color: 'white' }}>
                                <Link to="opv"> ORAL POLIO (OPV)</Link>
                            </Menu.Item>
                            <Menu.Item key="3" className="modified-item" style={{ background: '#95CEFF', marginLeft: 2, width: 210, color: 'white' }}>
                                <Link to="checklist">QUALITY CHECKLIST</Link>
                            </Menu.Item>
                        </Menu>
                    </Header>
                    <Content style={{ overflow: 'auto' }}>
                        <Router>
                            <MRDashboard path="/" d2={d2} />
                            <OPVDashboard path="/opv" d2={d2} />
                            <CheckList path="/checklist" d2={d2} />
                        </Router>
                    </Content>
                    <Footer style={{ textAlign: 'center', height: '64px' }}>Command Centre</Footer>
                </Layout>
            </LocationProvider>
        );
    }
}

App.propTypes = {
    d2: PropTypes.object.isRequired

};

export default App;
