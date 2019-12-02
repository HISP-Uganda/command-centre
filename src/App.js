import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';
import logo from './images/image.png';
import { inject, observer } from "mobx-react";
import { HashRouter as Router, Link, Route, Switch, Redirect } from "react-router-dom";
import { Form2Dashboard } from './components/Form2Dashboard';
import CheckList from './components/CheckList';
import { Form4Dashboard } from './components/Form4Dashboard';
import ManagementDashboard from './components/ManagementDashboard';
import D2UIApp from "@dhis2/d2-ui-app";
const { Header, Content } = Layout;

@inject('store')
@observer
class App extends Component {

    static childContextTypes = {
        d2: PropTypes.object.isRequired
    };

    getChildContext() {
        return { d2: this.props.d2 };
    }

    render() {
        const { d2, baseUrl, store } = this.props;
        const logout = `${baseUrl}/dhis-web-commons-security/logout.action`;
        const dataEntry = `${baseUrl}/dhis-web-dataentry/index.action`
        const dashboard = `${baseUrl}/dhis-web-dashboard/index.action`;
        return (
            <D2UIApp className="section-headerbar">
                <Router>
                    <Layout style={{ height: '100vh', padding: 0, margin: 0 }}>
                        <Header style={{ background: '#000066', display: 'flex', padding: 0 }}>
                            <div className="logo" style={{ width: 120, textAlign: 'center', height: 32 }}>
                                <img src={logo} alt="Logo" height="56" />
                            </div>
                            <Menu
                                mode="horizontal"
                                selectedKeys={[store.active]}
                                style={{ lineHeight: '64px', background: '#000066', display: 'flex', width: '100%' }}
                            >
                                <Menu.Item key="1" className="modified-item" style={{ textAlign: 'center', background: '#95CEFF', width: 250, color: 'white' }}>
                                    <Link to="/form4">FORM 4 DASHBOARD</Link>
                                </Menu.Item>

                                <Menu.Item key="2" className="modified-item" style={{ textAlign: 'center', background: '#95CEFF', marginLeft: 2, width: 250, color: 'white' }}>
                                    <Link to="/form2">FORM 2 DASHBOARD</Link>
                                </Menu.Item>

                                <Menu.Item key="3" className="modified-item" style={{ textAlign: 'center', background: '#95CEFF', marginLeft: 2, width: 250, color: 'white' }}>
                                    <Link to="/checklist">QUALITY CHECKLIST</Link>
                                </Menu.Item>

                                <Menu.Item key="4" className="modified-item" style={{ textAlign: 'center', background: '#95CEFF', marginLeft: 2, width: 250, color: 'white' }}>
                                    <a href={dataEntry}>DATA ENTRY FORM 4</a>
                                </Menu.Item>

                                <Menu.Item key="5" className="modified-item" style={{ textAlign: 'center', background: '#95CEFF', marginLeft: 2, width: 250, color: 'white' }}>
                                    <a href={dashboard}>DHIS2 DASHBOARD</a>
                                </Menu.Item>

                                <Menu.Item key="7" className="modified-item" style={{ textAlign: 'center', background: '#95CEFF', marginLeft: 2, width: 250, color: 'white' }}>
                                    <Link to="/management">MANAGEMENT DASHBOARD</Link>
                                </Menu.Item>
                                <div style={{ marginLeft: 'auto', paddingRight: 10 }}>
                                    <a href={logout}>LOGOUT</a>
                                </div>
                            </Menu>
                        </Header>
                        <Content>
                            <Switch>
                                <Route path="/form2">
                                    <Form2Dashboard d2={d2} />
                                </Route>
                                <Route path="/checklist">
                                    <CheckList d2={d2} />
                                </Route>
                                <Route path="/form4">
                                    <Form4Dashboard d2={d2} />
                                </Route>
                                <Route path="/management">
                                    <ManagementDashboard d2={d2} />
                                </Route>
                                <Route path="/">
                                    <Redirect to="/management" />
                                </Route>
                            </Switch>
                        </Content>
                        {/* <Footer style={{ textAlign: 'center', height: '64px' }}>Command Centre</Footer> */}
                    </Layout>
                </Router>
            </D2UIApp>
        );
    }
}

App.propTypes = {
    d2: PropTypes.object.isRequired

};

App.childContextTypes = {
    d2: PropTypes.object,
};

export default App;
