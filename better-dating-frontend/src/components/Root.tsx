import * as React from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { Provider } from 'react-redux';
import { Store, AnyAction } from 'redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { BetterDatingStoreState } from '../configureStore';
import Container from '@material-ui/core/Container';
import Meta from '../utils/Meta';
import * as Messages from './Messages';
import StatusSnackbar from '../containers/StatusSnackbar';
import Header from './Header';
import Routes from './Routes';
import Footer from './Footer';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
// import Navigation from './Navigation';

export interface Props {
	store: Store<BetterDatingStoreState, AnyAction>;
	theme: object;
}

const updated = process.env.REACT_APP_UPDATED || 'not_available';
const Root = ({ store, theme }: Props) => {
  return (
	  <Provider store={store}>
		  <ThemeProvider theme={theme}>
			  <Router basename="/">
				  <Meta
					  schema="AboutPage"
					  title={Messages.title}
					  description={Messages.metaDescription}
					  path="/"
					  contentType="website"
					  published="2019-07-26"
					  updated={updated}
				  />
				  {/* https://material-ui.com/components/css-baseline/ */}
				  <CssBaseline />
				  <Container maxWidth="md" style={{padding: '10px'}}>
					  <Header />
					  {/* FIXME <Navigation />*/}
	  				  <Routes />
	  				  <Paper style={{maxWidth: '300px', margin: 'auto', padding: '20px'}}>
						  <Typography style={{fontSize: '0.75rem'}}>
							{ `${Messages.updated}: ${updated}` }
						  </Typography>
					  </Paper>
					  <div style={{height: '60px'}} />
					  <Footer />
					  <StatusSnackbar />
				  </Container>
			  </Router>
		  </ThemeProvider>
	  </Provider>
  );
};

export default Root;
