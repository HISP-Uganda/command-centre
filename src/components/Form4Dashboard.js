import React from 'react'
import { Menu } from 'antd';
import {
    Switch,
    Route,
    Link,
    useRouteMatch
} from "react-router-dom";
import MR4Dashboard from './MR4Dashboard';
import OPV4Dashboard from './OPV4Dashboard';

export const Form4Dashboard = ({ d2 }) => {
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
                    <OPV4Dashboard d2={d2} />
                </Route>
                <Route path={`${path}`}>
                    <MR4Dashboard d2={d2} />
                </Route>
            </Switch>
        </div>
    )
}
