// next.config.js
const withPlugins = require("next-compose-plugins");
const optimizedImages = require("next-optimized-images");
const withCSS = require("@zeit/next-css");
const withOffline = require("next-offline");

function HACK_removeMinimizeOptionFromCssLoaders(config) {
  // https://github.com/vercel/next-plugins/issues/541
  console.warn(
    "HACK: Removing `minimize` option from `css-loader` entries in Webpack config"
  );
  config.module.rules.forEach((rule) => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach((u) => {
        if (u.loader === "css-loader" && u.options) {
          delete u.options.minimize;
        }
      });
    }
  });
}

module.exports = withPlugins(
  [
    [
      optimizedImages,
      {
        /* config for next-optimized-images */
      },
    ],
    [
      withCSS,
      {
        webpack: function (config) {
          // when trying to merge it with "raw-loader" config, check if image is still properly loaded
          config.module.rules.push({
            test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
            use: {
              loader: "url-loader",
              options: {
                limit: 100000,
                name: "[name].[ext]",
              },
            },
          });
          config.module.rules.push({
            test: /\.md|\.txt$/,
            use: "raw-loader",
          });
          HACK_removeMinimizeOptionFromCssLoaders(config);
          return config;
        },
      },
    ],
    [
      withOffline,
      {
        // generateInDevMode: true
      },
    ],
  ],
  {
    env: {
      NEXT_APP_UPDATED: process.env.NEXT_APP_UPDATED,
    },
    compress: false,
    async rewrites() {
      return [
        { source: encodeURI("/предложение"), destination: "/proposal" },
        {
          source: encodeURI("/подтвердить-почту"),
          destination: "/confirm-email",
        },
        { source: encodeURI("/регистрация"), destination: "/register-account" },
        { source: encodeURI("/вход"), destination: "/login" },
        { source: encodeURI("/профиль"), destination: "/profile" },
        {
          source: encodeURI("/благодарности"),
          destination: "/acknowledgements",
        },
        {
          source: encodeURI("/политика-конфиденциальности"),
          destination: "/privacy-policy",
        },
        {
          source: encodeURI("/пользовательское-соглашение"),
          destination: "/user-agreement",
        },
        {
          source: encodeURI("/удаление-профиля"),
          destination: "/remove-profile",
        },
        {
          source: encodeURI("/просмотр-профиля"),
          destination: "/view-profile",
        },
        {
          source: encodeURI("/администрирование"),
          destination: "/administration",
        },
      ];
    },
  }
);
