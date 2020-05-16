FROM node:12-slim AS builder
# https://stackoverflow.com/questions/50126741/how-to-remove-intermediate-images-from-a-build-after-the-build
LABEL stage=builder

COPY . /app
RUN cd /app && yarn install && NEXT_APP_UPDATED="$(date -u --iso-8601=seconds)" yarn run build

FROM node:12-alpine
RUN apk add --no-cache curl
COPY --from=builder /app /app
WORKDIR /app
CMD ["sh", "-c", "BACKEND_HOST=http://bd-backend:8080 PORT=8080 yarn run prod"]

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:8080/healthcheck || exit 1
