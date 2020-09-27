FROM redis:6.0.8-alpine
COPY redis.conf /usr/local/etc/redis/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
HEALTHCHECK --interval=30s --timeout=15s --retries=3 \
  CMD [[ "$(redis-cli PING)" == "PONG" ]] || exit 1