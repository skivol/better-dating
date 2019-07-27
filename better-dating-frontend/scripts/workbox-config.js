// https://developers.google.com/web/tools/workbox/modules/workbox-build
// https://developers.google.com/web/tools/workbox/guides/migrations/migrate-from-sw
module.exports = {
  globDirectory: '.',
  globPatterns: [
    "build/static/css/*.css",
    "build/static/js/*.js",
    "build/200.html",
    "build/index.html"
  ],
  swDest: 'build/service-worker.js',
  navigateFallback: "/200.html",
  // Ignores URLs starting from /__ (useful for Firebase):
  // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
  navigateFallbackWhitelist: [/^(?!\/__).*/],
  // By default, a cache-busting query parameter is appended to requests
  // used to populate the caches, to ensure the responses are fresh.
  // If a URL is already hashed by Webpack, then there is no concern
  // about it being stale, and the cache-busting can be skipped.
  dontCacheBustURLsMatching: /\.\w{8}\./,
  runtimeCaching: [
    {
      urlPattern: /api/,
      handler: "StaleWhileRevalidate"
    }
  ]
};
