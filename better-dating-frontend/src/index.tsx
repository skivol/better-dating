import React from 'react';
import { hydrate, render } from 'react-dom';
import 'typeface-roboto';
// Reason using "material-design-icons-iconfont" instead of "material-design-icons"
// https://github.com/yarnpkg/yarn/issues/5540
// Approach to include icons in webpack is taken from: https://stackoverflow.com/a/50312189
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './index.css';
import Root from './components/Root';
import * as serviceWorker from './serviceWorker';
import { configureAppStore } from './configureStore';
import { configureTheme } from './configureTheme';


// Webpack config in react-scripts
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js
// Consider "rescripts" if need customization
// https://github.com/harrysolovay/rescripts

const store = configureAppStore();

const theme = configureTheme();

const rootElement = document.getElementById('root') as HTMLElement;
if (rootElement.hasChildNodes()) {
  hydrate(<Root store={store} theme={theme} />, rootElement);
} else {
  render(<Root store={store} theme={theme} />, rootElement);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
