# [Running Tor Proxy with Docker](https://dev.to/nabarun/running-tor-proxy-with-docker-56n9)

# set alpine as the base image of the Dockerfile
FROM alpine:3.12.0

# install Tor and curl
RUN apk add --no-cache tor curl

# Copy over the torrc created above and set the owner to `tor`
COPY torrc /etc/tor/torrc
RUN chown -R tor /etc/tor

# Set `tor` as the default user during the container runtime
USER tor

# Set `tor` as the entrypoint for the image
ENTRYPOINT ["tor"]

EXPOSE 9050

# Set the default container command
# This can be overridden later when running a container
CMD ["-f", "/etc/tor/torrc"]

COPY healthcheck.sh /scripts/healthcheck.sh
HEALTHCHECK --interval=30s --timeout=15s --retries=3 --start-period=20s \
  CMD sh /scripts/healthcheck.sh || exit 1
