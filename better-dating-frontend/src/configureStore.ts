import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { StoreState } from './types/index';
import { EnthusiasmAction } from './actions/index';
import { enthusiasm } from './reducers/index';

export const configureAppStore = (preloadedState : StoreState) => {
	const composedEnhancers = composeWithDevTools();
	const store = createStore<StoreState | undefined, EnthusiasmAction, any, any>(enthusiasm, preloadedState, composedEnhancers);
	if (process.env.NODE_ENV !== 'production' && module.hot) {
	    module.hot.accept('./reducers', () => store.replaceReducer(enthusiasm))
	}
	return store;
};
