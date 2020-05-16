import { createStore, combineReducers, applyMiddleware, Action } from 'redux';
import logger from 'redux-logger';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { snackbarReducer } from './reducers';

const rootReducer = combineReducers({
	snackbar: snackbarReducer,
});

// https://redux.js.org/recipes/usage-with-typescript
export type BetterDatingStoreState = ReturnType<typeof rootReducer>;

export type ThunkResult<R> = ThunkAction<R, BetterDatingStoreState, undefined, Action>;
export type BetterDatingThunkDispatch = ThunkDispatch<BetterDatingStoreState, undefined, Action>;

const dev = process.env.NODE_ENV !== 'production';

export const configureStore = (preloadedState?: BetterDatingStoreState) => {
	const composedEnhancers = composeWithDevTools(applyMiddleware(...[...(dev ? [logger] : []), thunk]));
	const store = createStore(rootReducer, preloadedState, composedEnhancers);

	if (dev && module.hot) {
		module.hot.accept('./reducers', () => {
			console.log('Replacing reducer');
			store.replaceReducer(require('./reducers').default);
		});
	}

	return store;
};
