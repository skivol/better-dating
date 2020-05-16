// next.config.js
const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');
const withCSS = require('@zeit/next-css');
const withOffline = require('next-offline');

module.exports = withPlugins([
  [optimizedImages, {
    /* config for next-optimized-images */
  }],
  [withCSS, {
    webpack: function (config) {
      config.module.rules.push({
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
            name: '[name].[ext]'
          }
        }
      });
      return config;
    }
  }],
  [withOffline, {
    generateInDevMode: true
  }]
], {
  env: {
    NEXT_APP_UPDATED: process.env.NEXT_APP_UPDATED
  },
  compress: false,
  experimental: {
    async rewrites() {
      return [
        { source: encodeURI('/предложение'), destination: '/proposal' },
        { source: encodeURI('/подтвердить-почту'), destination: '/confirm-email' }
      ]
    }
  }
});
