# https://hub.docker.com/r/buildkite/puppeteer/
FROM buildkite/puppeteer as builder
# https://stackoverflow.com/questions/50126741/how-to-remove-intermediate-images-from-a-build-after-the-build
LABEL stage=builder

COPY . /app
RUN cd /app && yarn install && REACT_APP_UPDATED="$(date -u --iso-8601=seconds)" yarn run build-snap

# https://hub.docker.com/_/nginx
FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD curl -f http://localhost || exit 1
