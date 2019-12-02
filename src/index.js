import React from 'react';
import ReactDOM from 'react-dom';
import { init as d2Init, config, getUserSettings } from 'd2';
// temporary workaround until new ui headerbar is ready
import 'material-design-icons/iconfont/material-icons.css';
import { Provider } from "mobx-react";
import App from './App';
import './App.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// import i18n from './locales';
import { store } from './stores/Store';
let baseUrl;
if (process.env.NODE_ENV === 'development') {
    // config.baseUrl = 'http://localhost:8080/api'
    // baseUrl = 'http://localhost:8080';
    config.baseUrl = 'https://mrcommandcentre.org/api'
    baseUrl = 'https://mrcommandcentre.org'
    config.headers = { Authorization: 'Basic YWRtaW46RGlzdHJpY3QxIw==' };
    // config.headers = { Authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=' };
} else {
    let urlArray = window.location.pathname.split('/');
    let apiIndex = urlArray.indexOf('api');
    if (apiIndex > 1) {
        baseUrl = '/' + urlArray[apiIndex - 1] + '/';
    } else {
        baseUrl = '/';
    }

    baseUrl = window.location.protocol + '//' + window.location.host + baseUrl;
    config.baseUrl = baseUrl + 'api'
}

const init = async () => {
    const initializedD2 = await getUserSettings().then(() => d2Init(config));
    initializedD2.i18n.translations['id'] = 'Id';
    store.setD2(initializedD2);
    ReactDOM.render(
        <Provider store={store}>
            <App d2={initializedD2} baseUrl={baseUrl} />
        </Provider>, document.getElementById('root'));
    window.d2 = initializedD2;
};

init();
