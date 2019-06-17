import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { createStore } from 'redux';
import { enthusiasm } from './reducers/index';
import { EnthusiasmAction } from './actions/index';
import { StoreState } from './types/index';
import Hello from './containers/Hello';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

const store = createStore<StoreState | undefined, EnthusiasmAction, any, any>(enthusiasm, {
  enthusiasmLevel: 1,
  languageName: 'TypeScript',
});

ReactDOM.render(
  <Provider store={store}>
    <Hello />
  </Provider>,
  document.getElementById('root') as HTMLElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
