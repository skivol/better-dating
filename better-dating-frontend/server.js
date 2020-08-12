/* eslint-disable no-console */
const next = require('next');
const express = require('express');
const path = require('path');

const devProxy = {
  '/api': {
    target: 'http://localhost:8080/api/',
    pathRewrite: { '^/api': '/' },
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('Forwarded', 'host=localhost:3000;proto=http');
    }
  },
};

const port = parseInt(process.env.PORT, 10) || 3000;
const env = process.env.NODE_ENV;
const dev = env !== 'production';

const app = next({
  dir: '.', // base directory where everything is, could move to src later
  dev,
});
const handle = app.getRequestHandler();

const createAndConfigureServer = () => {
  const server = express();

  // Set up the proxy.
  if (dev && devProxy) {
    const proxyMiddleware = require('http-proxy-middleware');
    Object.keys(devProxy).forEach(function (context) {
      server.use(proxyMiddleware(context, devProxy[context]))
    });
  }

  // Health check
  server.get('/healthcheck', function (request, response) {
    response.send({ healthy: true });
  });

  server.get('/service-worker.js', function (request, response) {
    response.sendFile(path.resolve(__dirname, './.next', 'service-worker.js'));
  });

  // Default catch-all handler to allow Next.js to handle all other routes
  server.all('*', (req, res) => handle(req, res));

  return server;
}

app
  .prepare()
  .then(() => {
    createAndConfigureServer().listen(port, err => {
      if (err) {
        throw err;
      }
      console.log(`> Ready on port ${port} [${env}]`);
    });
  })
  .catch(err => {
    console.log('An error occurred, unable to start the server');
    console.log(err);
  });
