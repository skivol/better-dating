import * as React from "react";
import { Provider } from 'react-redux';
import { Store, AnyAction } from 'redux';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { StoreState } from '../types/index';
import Hello from '../containers/Hello';
import Navigation from './Navigation';
import NavigationUrls from './NavigationUrls';

export interface Props {
	store: Store<StoreState, AnyAction>;
}

const Root = ({ store }: Props) => {
  return (
	  <Provider store={store}>
		  <Router>
			  <Navigation />
			  <Switch>
				  <Route exact path="/" render={() => (
					  <Redirect to={NavigationUrls.motivationUrl} />
				  )} />
				  <Route path={NavigationUrls.motivationUrl} component={Hello} />
			  </Switch>
		  </Router>
	  </Provider>
  );
}

export default Root;
