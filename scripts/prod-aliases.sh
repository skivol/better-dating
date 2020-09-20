# Usage:
# source /home/user/bd/prod-aliases.sh
# wd points:
# bd-prod  ->  ~/bd
# bd-backups  ->  ~/bd/backups

alias refresh='source ~/.zshrc'
alias vim-z='vim ~/.zshrc'
alias docker-cleanup-images='docker rmi $(docker images -f "dangling=true" -q)'
# https://docs.docker.com/engine/reference/commandline/rm/
alias docker-cleanup-containers='docker rm $(docker ps -a -q)'

alias bd-prod-deploy='wd bd-prod && env $(grep -v "^#" .env | xargs) docker stack deploy --compose-file docker-compose.yml better-dating'
#docker service scale better-dating_bd-reverse-proxy=0 better-dating_bd-backend=0 better-dating_bd-frontend=0 better-dating_bd-postgres=0

SMOTRINY_UKR='xn--h1aheckdj9e.xn--j1amh'
SMOTRINY_RUS='xn--h1aheckdj9e.xn--p1acf'
alias bd-prod-certbot-get="sudo certbot certonly --standalone -d "
alias bd-prod-certbot-expand="sudo certbot certonly --standalone --cert-name $SMOTRINY_UKR -d $SMOTRINY_UKR -d www.$SMOTRINY_UKR -d $SMOTRINY_RUS -d www.$SMOTRINY_RUS"
service-logs() {
	docker service logs /better-dating_bd-$1
}
alias bd-prod-proxy-logs='service-logs reverse-proxy'
alias bd-prod-backend-logs='service-logs backend'
alias bd-prod-ui-logs='service-logs ui'
alias bd-prod-db-logs='service-logs postgres'
alias bd-prod-psql='docker run --rm --name prod-psql --network better-dating_default --link better-dating_bd-postgres:better-dating_bd-postgres -it postgres:alpine psql -h better-dating_bd-postgres -U bd-user better-dating'

# https://forums.docker.com/t/rolling-update-with-same-tag/19400/5
update-service() {
	docker service update --env-add "UPDATE_DATE=$(date)" better-dating_bd-$1
}
alias bd-prod-update-frontend='update-service frontend'
alias bd-prod-update-backend='update-service backend'
alias bd-prod-update-proxy='update-service reverse-proxy'
alias bd-prod-update-database='update-service postgres'

# Backups
# Letsencrypt
alias bd-prod-backup-letsencrypt-create='wd bd-backups && sudo zip -r bd-letsencrypt.zip /etc/letsencrypt/'
# Database
## https://stackoverflow.com/a/29913462
## https://stackoverflow.com/questions/45923445/pg-dumpall-missing-in-connection-string
## https://stackoverflow.com/questions/24718706/backup-restore-a-dockerized-postgresql-database
alias bd-prod-backup-db-dump='wd bd-backups && docker exec -i $(docker ps --filter "name=better-dating_bd-postgres" --format "{{.Names}}") pg_dumpall -c -l better-dating -U bd-user | gzip > db/dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql.gz'
# TODO backup data volumes instead: https://docs.docker.com/storage/volumes/#backup-restore-or-migrate-data-volumes

# Docker
## Update
alias docker-update='sudo yum update docker-ce docker-ce-cli containerd.io'
## Troubleshooting
### https://docs.docker.com/engine/reference/commandline/ps/
alias docker-remove-created='docker rm -f $(docker ps --filter "status=created" --format "{{.ID}}")'
alias docker-restart='sudo service docker restart'
