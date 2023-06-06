FROM node:14.11.0-slim AS builder
# https://stackoverflow.com/questions/50126741/how-to-remove-intermediate-images-from-a-build-after-the-build
LABEL stage=builder

COPY ./tsconfig.json /app/tsconfig.json
COPY ./server.js /app/server.js
COPY ./next-env.d.ts /app/next-env.d.ts
COPY ./next.config.js /app/next.config.js
COPY ./public /app/public
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./src /app/src

# https://stackoverflow.com/questions/18136746/npm-install-failed-with-cannot-run-in-wd#comment89313677_48170041
RUN npm set unsafe-perm true
RUN cd /app && npm i && NEXT_APP_UPDATED="$(date -u --iso-8601=seconds)" npm run build

FROM node:14.11.0-alpine
RUN apk add --no-cache curl
COPY --from=builder /app /app
WORKDIR /app
CMD ["sh", "-c", "BACKEND_HOST=http://bd-backend:8080 PORT=8080 npm run prod"]

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:8080/healthcheck || exit 1
