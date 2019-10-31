FROM postgres:alpine
COPY healthcheck.sh /scripts/healthcheck.sh
HEALTHCHECK --interval=30s --timeout=15s --retries=3 \
  CMD bash /scripts/healthcheck.sh || exit 1
