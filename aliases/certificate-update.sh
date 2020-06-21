#!/bin/bash

# Stop proxy
docker service scale better-dating_bd-reverse-proxy=0

status=
# Renew certificates (certbot)
sudo certbot renew --force-renewal

if [ $? -eq 0 ]; then
    # Remove proxy secrets
    docker service update better-dating_bd-reverse-proxy --secret-rm ssl_certificate --secret-rm ssl_certificate_key

    # Remove docker secrets
    docker secret rm ssl_certificate ssl_certificate_key

    # Add certificate to docker secrets
    # https://stackoverflow.com/questions/51104049/unable-to-create-docker-secret-with-stdin
    SMOTRINY_UKR='xn--h1aheckdj9e.xn--j1amh'
    sudo cat /etc/letsencrypt/live/$SMOTRINY_UKR/fullchain.pem | docker secret create ssl_certificate -

    # Add key to docker secrets
    sudo cat /etc/letsencrypt/live/$SMOTRINY_UKR/privkey.pem | docker secret create ssl_certificate_key -

    # Add proxy secrets
    docker service update better-dating_bd-reverse-proxy --secret-add ssl_certificate --secret-add ssl_certificate_key
    status="succeeded"
else
    status="failed"
fi;

# Start proxy
docker service scale better-dating_bd-reverse-proxy=1

logFile=~/certificate-update.log
echo $(date -u)" - $status renewing certificate" >> $logFile
