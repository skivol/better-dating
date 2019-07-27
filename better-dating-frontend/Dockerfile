# https://hub.docker.com/r/buildkite/puppeteer/
FROM buildkite/puppeteer as builder

COPY . /app
RUN cd /app && yarn install && REACT_APP_UPDATED="$(date)" yarn run build-snap

# https://hub.docker.com/_/nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
