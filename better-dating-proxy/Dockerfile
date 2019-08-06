# https://hub.docker.com/_/nginx
FROM nginx:alpine
RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/nginx.conf
COPY certificates.conf /etc/nginx/certificates.conf
COPY ssl.conf /etc/nginx/ssl.conf

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD curl -f http://localhost/nginx_status || exit 1
