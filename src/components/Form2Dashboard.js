import React from 'react'
import { Menu } from 'antd';

import {
    Switch,
    Route,
    Link,
    useRouteMatch
} from "react-router-dom";
import MRDashboard from './MRDashboard';
import OPVDashboard from './OPVDashboard';

export const Form2Dashboard = ({ d2 }) => {

    let { path } = useRouteMatch();

    return (
        <div>
            <Menu mode="horizontal">
                <Menu.Item key="mail">
                    <Link to={`${path}`}>RUBELLA</Link>
                </Menu.Item>
                <Menu.Item key="app">
                    <Link to={`${path}/opv`}>OPV</Link>
                </Menu.Item>
            </Menu>
            <Switch>
                <Route path={`${path}/opv`}>
                    <OPVDashboard d2={d2} />
                </Route>
                <Route path={`${path}`}>
                    <MRDashboard d2={d2} />
                </Route>
            </Switch>
        </div>
    )
}
