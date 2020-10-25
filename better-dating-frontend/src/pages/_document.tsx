import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/core/styles';
import { Helmet } from 'react-helmet';
import { theme } from '../configureTheme';

export default class MyDocument extends Document<{ helmet: any; }> {
  static async getInitialProps(ctx: any) {
    // Resolution order
    //
    // On the server:
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. document.getInitialProps
    // 4. app.render
    // 5. page.render
    // 6. document.render
    //
    // On the server with error:
    // 1. document.getInitialProps
    // 2. app.render
    // 3. page.render
    // 4. document.render
    //
    // On the client
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. app.render
    // 4. page.render

    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: any) => (props: any) => sheets.collect(<App {...props} />),
      });

    const initialProps = await Document.getInitialProps(ctx);

    // see https://github.com/nfl/react-helmet#server-usage for more information
    // 'head' was occupied by 'renderPage().head', we cannot use it
    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
      helmet: Helmet.renderStatic()
    };
  }

  // should render on <html>
  get helmetHtmlAttrComponents() {
    return this.props.helmet.htmlAttributes.toComponent();
  }

  // should render on <body>
  get helmetBodyAttrComponents() {
    return this.props.helmet.bodyAttributes.toComponent();
  }

  // should render on <head>
  get helmetHeadComponents() {
    const { helmet } = this.props;
    return Object.keys(helmet)
      .filter(el => !['htmlAttributes', 'bodyAttributes'].includes(el))
      .map(el => helmet[el].toComponent());
  }

  render() {
    return (
      <Html {...this.helmetHtmlAttrComponents}>
        <Head>
          {this.helmetHeadComponents}
          <meta charSet="utf-8" />

          <link rel="shortcut icon" href="/favicon.ico" />

          <link rel="icon" sizes="16x16 32x32 64x64" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="196x196" href="/favicon-192.png" />
          <link rel="icon" type="image/png" sizes="160x160" href="/favicon-160.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
          <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />

          <link rel="apple-touch-icon" href="/favicon-57.png" />
          <link rel="apple-touch-icon" sizes="114x114" href="/favicon-114.png" />
          <link rel="apple-touch-icon" sizes="72x72" href="/favicon-72.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/favicon-144.png" />
          <link rel="apple-touch-icon" sizes="60x60" href="/favicon-60.png" />
          <link rel="apple-touch-icon" sizes="120x120" href="/favicon-120.png" />
          <link rel="apple-touch-icon" sizes="76x76" href="/favicon-76.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/favicon-152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />

          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />

          <meta name="msapplication-TileColor" content="#FFFFFF" />
          <meta name="msapplication-TileImage" content="/favicon-144.png" />
          <meta name="msapplication-config" content="/browserconfig.xml" />

          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
          {/*
            manifest.json provides metadata used when your web app is installed on a
            user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
           */}
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body {...this.helmetBodyAttrComponents}>
          <noscript>Вам нужно включить JavaScript для полноценной работы данного сайта.</noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
