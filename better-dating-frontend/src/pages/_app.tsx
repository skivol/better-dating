import React from 'react';
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { theme } from '../configureTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatusSnackbar from '../containers/StatusSnackbar';
import Meta from '../utils/Meta';
import * as Messages from '../components/Messages';

import 'typeface-roboto';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '../index.css';
import { configureStore } from '../configureStore';

config.autoAddCss = false;

const store = configureStore();
const updated = process.env.NEXT_APP_UPDATED || 'not_available';

const BetterDatingApp = ({ Component, pageProps }: AppProps) => {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement!.removeChild(jssStyles);
    }
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Meta
          schema="AboutPage"
          title={Messages.title}
          description={Messages.metaDescription}
          path="/"
          published="2019-07-26"
          updated={updated}
        />
        <Container maxWidth="md" style={{ padding: '10px' }}>
          <Header />
          {/* FIXME <Navigation />*/}
          <Component {...pageProps} />
          <Paper style={{ maxWidth: '300px', margin: 'auto', padding: '20px' }}>
            <Typography style={{ fontSize: '0.75rem' }}>
              {`${Messages.updated}: ${updated}`}
            </Typography>
          </Paper>
          <div style={{ height: '60px' }} />
          <Footer />
          <StatusSnackbar />
        </Container>
      </ThemeProvider>
    </Provider>
  )
}

export default BetterDatingApp;
