import React from 'react';
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';

import Container from '@material-ui/core/Container';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { theme } from '../configureTheme';
import Footer from '../components/toplevel/Footer';
import Navigation from '../components/navigation/Navigation';
import StatusSnackbar from '../containers/StatusSnackbar';
import Meta from '../utils/Meta';
import * as Messages from '../components/Messages';
import { configureStore } from '../configureStore';

import 'typeface-roboto';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '../index.css';

config.autoAddCss = false;

const store = configureStore();

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
        />
        <Container className="u-padding-10px u-max-width-892px">
          <Component {...pageProps} />
          <Footer />
          <div className="c-bottom-navigation-placeholder" />
          <Navigation />
          <StatusSnackbar />
        </Container>
      </ThemeProvider>
    </Provider>
  )
}

export default BetterDatingApp;
