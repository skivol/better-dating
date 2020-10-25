import { useEffect } from "react";
import { AppProps } from "next/app";
import { Provider } from "react-redux";

import { ThemeProvider } from "@material-ui/core/styles";
import { Container, CssBaseline } from "@material-ui/core";

import { theme } from "../configureTheme";
import Header from "../components/toplevel/Header";
import Footer from "../components/toplevel/Footer";
import StatusSnackbar from "../components/StatusSnackbar";
import Meta from "../utils/Meta";
import * as Messages from "../components/Messages";
import { configureStore } from "../configureStore";

import "typeface-roboto";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../index.css";

config.autoAddCss = false;

const store = configureStore();

const BetterDatingApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
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
        <Header />
        <Container
          className="u-padding-10px u-max-width-892px"
          style={{ background: "white", borderRadius: "10px", marginTop: 65 }}
        >
          <Component {...pageProps} />
          <Footer />
          <StatusSnackbar />
        </Container>
      </ThemeProvider>
    </Provider>
  );
};

export default BetterDatingApp;
