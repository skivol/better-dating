import * as React from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { Provider } from 'react-redux';
import { Store, AnyAction } from 'redux';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { BetterDatingStoreState } from '../configureStore';
import Container from '@material-ui/core/Container';
import Proposal from '../containers/Proposal';
import ConfirmEmail from '../containers/ConfirmEmail';
import StatusSnackbar from '../containers/StatusSnackbar';
import Header from './Header';
import Footer from './Footer';
// import Navigation from './Navigation';
import NavigationUrls from './NavigationUrls';

export interface Props {
	store: Store<BetterDatingStoreState, AnyAction>;
	theme: object;
}

const redirectToProposal = () => (
	<Redirect to={NavigationUrls.proposalUrl} />
);
const Root = ({ store, theme }: Props) => {
  return (
	  <Provider store={store}>
		  <ThemeProvider theme={theme}>
			  <Router>
				  {/* https://material-ui.com/components/css-baseline/ */}
				  <CssBaseline />
				  <Container maxWidth="md" style={{padding: '10px'}}>
					  <Header />
					  {/* FIXME <Navigation />*/}
					  <Switch>
						  <Route exact path="/" render={redirectToProposal} />
						  {/* TODO add used technologies page */}
						  {/* TODO add contacts/help page */}
						  {/* TODO add questionnaire ? */}
						  {/* TODO reference Wikipedia's article and picture: https://ru.wikipedia.org/wiki/Смотрины */}
						  <Route path={NavigationUrls.proposalUrl} component={Proposal} />
						  <Route path={NavigationUrls.confirmEmail} component={ConfirmEmail} />
						  <Route render={redirectToProposal} />
					  </Switch>
					  <Footer />
					  <StatusSnackbar />
				  </Container>
			  </Router>
		  </ThemeProvider>
	  </Provider>
  );
};

export default Root;
