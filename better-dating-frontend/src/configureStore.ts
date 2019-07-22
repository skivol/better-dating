import { createStore, combineReducers, applyMiddleware, Action } from 'redux';
import { reducer as formReducer } from 'redux-form';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { BetterDatingAction } from './actions';
import { snackbarReducer, expiredTokenReducer } from './reducers';

const rootReducer = combineReducers({
	snackbar: snackbarReducer,
	expiredToken: expiredTokenReducer,
	form: formReducer
});

// https://redux.js.org/recipes/usage-with-typescript
export type BetterDatingStoreState = ReturnType<typeof rootReducer>;

export type ThunkResult<R> = ThunkAction<R, BetterDatingStoreState, undefined, Action>;
export type BetterDatingThunkDispatch = ThunkDispatch<BetterDatingStoreState, undefined, Action>;

export const configureAppStore = (preloadedState? : BetterDatingStoreState) => {
	const composedEnhancers = composeWithDevTools(applyMiddleware(thunk));
	const store = createStore<BetterDatingStoreState, BetterDatingAction, any, any>(
		rootReducer, preloadedState, composedEnhancers
	);
	if (process.env.NODE_ENV !== 'production' && module.hot) {
		module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
	}
	return store;
};
