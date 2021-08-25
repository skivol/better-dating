// next.config.js
const withPlugins = require("next-compose-plugins");
const withOffline = require("next-offline");

module.exports = withPlugins(
  [
    [
      withOffline,
      {
        // generateInDevMode: true
      },
    ],
  ],
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
      return config;
    },
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
        { source: encodeURI("/свидания"), destination: "/dating" },
        { source: encodeURI("/события"), destination: "/history" },
        { source: encodeURI("/добавление-места"), destination: "/add-location" },
        { source: encodeURI("/проверка-места"), destination: "/check-location" },
        { source: encodeURI("/просмотр-места"), destination: "/view-location" },
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
