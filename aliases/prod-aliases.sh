# Usage:
# source /home/adm1n/bd/prod-aliases.sh

alias refresh='source ~/.zshrc'
alias vim-z='vim ~/.zshrc'
alias docker-cleanup-images='docker rmi $(docker images -f "dangling=true" -q)'
# https://docs.docker.com/engine/reference/commandline/rm/
alias docker-cleanup-containers='docker rm $(docker ps -a -q)'

alias bd-prod-deploy='wd bd-prod && env $(grep -v "^#" .env | xargs) docker stack deploy --compose-file docker-compose.yml better-dating'
#docker service scale better-dating_bd-reverse-proxy=0 better-dating_bd-backend=0 better-dating_bd-frontend=0 better-dating_bd-postgres=0
alias bd-prod-proxy-stop='docker service scale better-dating_bd-reverse-proxy=0'
alias bd-prod-proxy-remove-secrets='docker service update better-dating_bd-reverse-proxy --secret-rm ssl_certificate --secret-rm ssl_certificate_key'
alias bd-prod-docker-rm-secrets='docker secret rm ssl_certificate ssl_certificate_key'
# TODO -d смотрины.укр
# TODO extract puny name to variable
alias bd-prod-certbot-get='sudo certbot certonly --standalone -d xn--h1aheckdj9e.xn--j1amh'
alias bd-prod-certbot-expand='sudo certbot certonly --standalone --cert-name xn--h1aheckdj9e.xn--j1amh -d xn--h1aheckdj9e.xn--j1amh -d www.xn--h1aheckdj9e.xn--j1amh -d xn--h1aheckdj9e.xn--p1acf -d www.xn--h1aheckdj9e.xn--p1acf'
alias bd-prod-certbot-renew='sudo certbot renew --force-renewal'
# TODO use configure crontab for the command
# TODO consider starting the proxy in the end regardless of renew success
# https://askubuntu.com/questions/1071263/multi-line-alias-in-bash
alias bd-prod-certificates-update='bd-prod-proxy-stop && bd-prod-certbot-renew \
	&& bd-prod-proxy-remove-secrets && bd-prod-docker-rm-secrets \
	&& bd-prod-docker-add-secret-certificate && bd-prod-docker-add-secret-key \
	&& bd-prod-proxy-add-secrets && bd-prod-proxy-start'
# https://stackoverflow.com/questions/51104049/unable-to-create-docker-secret-with-stdin
alias bd-prod-docker-add-secret-certificate='sudo cat /etc/letsencrypt/live/xn--h1aheckdj9e.xn--j1amh/fullchain.pem | docker secret create ssl_certificate -'
alias bd-prod-docker-add-secret-key='sudo cat /etc/letsencrypt/live/xn--h1aheckdj9e.xn--j1amh/privkey.pem | docker secret create ssl_certificate_key -'
alias bd-prod-proxy-add-secrets='docker service update better-dating_bd-reverse-proxy --secret-add ssl_certificate --secret-add ssl_certificate_key'
alias bd-prod-proxy-start='docker service scale better-dating_bd-reverse-proxy=1'
alias bd-prod-proxy-logs='docker service logs /better-dating_bd-reverse-proxy'
alias bd-prod-backend-logs='docker service logs /better-dating_bd-backend'
alias bd-prod-ui-logs='docker service logs /better-dating_bd-ui'
alias bd-prod-db-logs='docker service logs /better-dating_bd-postgres'
alias bd-prod-psql=' docker run --rm --name prod-psql --network better-dating_default --link better-dating_bd-postgres:better-dating_bd-postgres -it postgres:alpine psql -h better-dating_bd-postgres -U bd-user better-dating'

# https://forums.docker.com/t/rolling-update-with-same-tag/19400/5
alias bd-prod-update-frontend='docker service update --env-add "UPDATE_DATE=$(date)" better-dating_bd-frontend'
alias bd-prod-update-backend='docker service update --env-add "UPDATE_DATE=$(date)" better-dating_bd-backend'
alias bd-prod-update-proxy='docker service update --env-add "UPDATE_DATE=$(date)" better-dating_bd-reverse-proxy'
alias bd-prod-update-database='docker service update --env-add "UPDATE_DATE=$(date)" better-dating_bd-postgres'

# Backups
# Letsencrypt
alias bd-prod-backup-letsencrypt-create='sudo zip -r /home/adm1n/backups/bd-letsencrypt.zip /etc/letsencrypt/'
# Database
## https://stackoverflow.com/a/29913462
## https://stackoverflow.com/questions/45923445/pg-dumpall-missing-in-connection-string
## https://stackoverflow.com/questions/24718706/backup-restore-a-dockerized-postgresql-database
alias bd-prod-backup-db-dump='docker exec -i $(docker ps --filter "name=better-dating_bd-postgres" --format "{{.Names}}") pg_dumpall -c -l better-dating -U bd-user | gzip > /home/adm1n/backups/db/dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql.gz'
