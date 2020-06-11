# Example usage in ~/.zshrc:
# source /mnt/d/Downloads/projects/better-dating/aliases/dev-aliases.sh
# Prerequisites: wd points (in, for example, WSL2)
#  * All warp points:
#     projects  ->  /mnt/d/Downloads/projects
#         proj  ->  /mnt/d/Downloads/projects/better-dating
#      proj-ui  ->  /mnt/d/Downloads/projects/better-dating/better-dating-frontend
# proj-backend  ->  /mnt/d/Downloads/projects/better-dating/better-dating-backend
#   proj-proxy  ->  /mnt/d/Downloads/projects/better-dating/better-dating-proxy
#
# Note: avoid duplicating maven / gradle / node local repositories (for example, point WSL & host to same dirs)

GRADLE_USER_HOME=/mnt/d/Downloads/projects/.gradle

bd-ui-server() {
	wd proj-ui && export $(grep -v "^#" ../.env-dev | xargs) && NEXT_APP_UPDATED="$(date -u --iso-8601=seconds)" pnpm run dev
}
alias bd-ui-test='wd proj-ui && pnpm run test'
bd-ui-build() {
	wd proj-ui && NEXT_APP_UPDATED="$(date -u --iso-8601=seconds)" pnpm run build
}
alias bd-ui-docker-build='wd proj-ui && docker build -t skivol/better-dating-ui:latest . && docker image prune -f --filter label=stage=builder'
alias bd-ui-docker-run='docker run --rm --name better-dating-ui -d -p 8080:80 skivol/better-dating-ui:latest'
alias bd-ui-docker-stop='docker stop better-dating-ui'
alias bd-ui-view='wslview http://localhost:3000/предложение'
alias bd-prod-view='wslview https://смотрины.укр'
alias bd-backend-docker-build='wd proj-backend && docker build -t skivol/better-dating-backend:latest .'
alias bd-backend-docker-run='docker run --name better-dating-backend -d -p 8080:8080 skivol/better-dating-backend:latest'
alias bd-backend-docker-start='docker start better-dating-backend'
alias bd-backend-docker-stop='docker stop better-dating-backend'
alias bd-proxy-docker-build='wd proj-proxy && docker build -t skivol/better-dating-proxy:latest .'
alias bd-database-docker-build='wd proj-db && docker build -t skivol/better-dating-database:latest .'
# FIXME "backend" image gets "invalid diffid for layer 1" on load...
# alias bd-proxy-docker-save='wd proj-images && docker image save skivol/better-dating-proxy:latest > better-dating-proxy.tar'
# alias bd-backend-docker-save='wd proj-images && docker image save skivol/better-dating-backend:latest > better-dating-backend.tar'
# alias bd-ui-docker-save='wd proj-images && docker image save skivol/better-dating-ui:latest > better-dating-ui.tar'
# alias bd-docker-save='bd-proxy-docker-save && bd-backend-docker-save && bd-ui-docker-save'
# https://www.cyberciti.biz/faq/show-progress-during-file-transfer/
# alias bd-docker-rsync='rsync -vrltD --progress --stats --human-readable /d/Downloads/projects/better-dating/images adm1n@77.120.103.21:/home/adm1n/bd'

# Vim
alias bd-ui-vim='wd proj-ui && vim'
alias bd-backend-vim='wd proj-backend && vim'
alias bd-vim='wd proj && vim -p better-dating-backend better-dating-frontend'

alias bd-backend-gradle="export GRADLE_USER_HOME=$GRADLE_USER_HOME && wd proj-backend && ./gradlew"
alias bd-backend-build='bd-backend-gradle build'
alias bd-backend-compile='bd-backend-gradle compileJava'
alias bd-backend-test='bd-backend-gradle test'
alias bd-backend-test-compile='bd-backend-gradle testClasses'
alias bd-backend-update-deps='bd-backend-gradle useLatestVersions'
# https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/html/#running-your-application-passing-arguments
bd-backend-server() {
	(wd proj && export $(grep -v "^#" .env-dev | xargs) && bd-backend-gradle run $* --args="--spring.mail.username=$BD_MAIL_USER --passwordfiles.mail=$BD_MAIL_PASSWORD_FILE --datasource.username=$BD_DB_USER --passwordfiles.db=$BD_DB_PASSWORD_FILE")
}
bd-backend-server-with-mail() {
	(wd proj && export $(grep -v "^#" .env-dev | xargs) && bd-backend-gradle run $* --args="--spring.profiles.active=development,mail --spring.mail.username=$BD_MAIL_USER --passwordfiles.mail=$BD_MAIL_PASSWORD_FILE --datasource.username=$BD_DB_USER --passwordfiles.db=$BD_DB_PASSWORD_FILE")
}

alias bd-backend-debug='bd-backend-server --debug-jvm'
alias bd-backend-with-mail-debug='bd-backend-server-with-mail --debug-jvm'
alias bd-backend-test-results='wslview "D:\Downloads\projects\better-dating\better-dating-backend\build\reports\tests\test\index.html"'
alias bd-build='bd-backend-build && bd-ui-build'
alias bd-docker-build='bd-backend-docker-build && bd-ui-docker-build && bd-proxy-docker-build'
alias bd-deploy='wd proj && env $(grep -v "^#" .env-dev | xargs) docker stack deploy --compose-file docker-compose.yml better-dating'
alias bd-stop='docker service scale better-dating_bd-reverse-proxy=0 better-dating_bd-backend=0 better-dating_bd-frontend=0 better-dating_bd-postgres=0'
alias bd-proxy-stop='docker service scale better-dating_bd-reverse-proxy=0'
alias bd-proxy-start='docker service scale better-dating_bd-reverse-proxy=1'
alias bd-backend-stop='docker service scale better-dating_bd-backend=0'
alias bd-backend-start='docker service scale better-dating_bd-backend=1'
alias bd-start='docker service scale better-dating_bd-reverse-proxy=1 better-dating_bd-backend=1 better-dating_bd-frontend=1 better-dating_bd-postgres=1'
alias bd-rm='docker stack rm better-dating'
# https://stackoverflow.com/questions/19331497/set-environment-variables-from-file-of-key-pair-values
alias docker-cleanup-images='docker rmi $(docker images -f "dangling=true" -q)'
# https://docs.docker.com/engine/reference/commandline/rm/
alias docker-cleanup-containers='docker rm $(docker ps -a -q)'
# https://linuxize.com/post/how-to-remove-docker-images-containers-volumes-and-networks/
alias docker-cleanup-everything='docker system prune --volumes --force'

alias idea='/mnt/c/Program\ Files\ \(x86\)/JetBrains/IntelliJ\ IDEA\ Community\ Edition\ 2019.1.1/bin/idea64.exe'

# https://hub.docker.com/_/postgres
alias bd-db-run='docker run --name bd-db --publish 5432:5432 -e POSTGRES_PASSWORD=postgres -d --rm postgres:alpine'
alias bd-db-stop='docker stop bd-db'
## Psql docs: https://www.postgresql.org/docs/current/app-psql.html
## https://stackoverflow.com/questions/37099564/docker-how-can-run-the-psql-command-in-the-postgres-container
## Describe table: https://stackoverflow.com/questions/109325/postgresql-describe-table
## Dump table schema: https://stackoverflow.com/questions/2593803/how-to-generate-the-create-table-sql-statement-for-an-existing-table-in-postgr
### https://www.postgresql.org/docs/current/app-pgdump.html
alias psql='docker exec -it bd-db psql -d postgres -U postgres -w'
# alias psql='docker run --rm --name psql --link bd-db:bd-db -it postgres:alpine psql -h bd-db -U bd-user better-dating'
# https://stackoverflow.com/questions/41847656/network-not-manually-attachable-when-running-one-off-command-against-docker-sw
alias prod-psql='docker run --rm --name prod-psql --network better-dating_default --link better-dating_bd-postgres:better-dating_bd-postgres -it postgres:alpine psql -h better-dating_bd-postgres -U postgres postgres'

# https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-centos7
# https://stackoverflow.com/questions/50735833/what-is-the-difference-between-chmod-go-rwx-and-chmod-700
# cat ~/.ssh/id_rsa.pub | ssh adm1n@77.120.103.21 "mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && chmod -R go= ~/.ssh && cat >> ~/.ssh/authorized_keys"
alias prod-ssh='ssh adm1n@77.120.103.21'
prod-ssh-zsh() {
	prod-ssh "/bin/zsh -ic '$*'"
}
# https://www.cyberciti.biz/faq/unix-linux-execute-command-using-ssh/
# https://stackoverflow.com/questions/55802095/running-local-container-when-connected-to-remote-docker-machine
alias prod-docker-load="prod-ssh 'cd /home/adm1n/bd/images && docker load --input better-dating-proxy.tar && docker load --input better-dating-backend.tar && docker load --input better-dating-ui.tar'"
# https://stackoverflow.com/a/26226261
alias bd-backend-transfer-image-to-prod="docker save skivol/better-dating-backend:latest | bzip2 | pv | prod-ssh 'bunzip2 | docker load'"
alias bd-ui-transfer-image-to-prod="docker save skivol/better-dating-ui:latest | bzip2 | pv | prod-ssh 'bunzip2 | docker load'"
alias bd-proxy-transfer-image-to-prod="docker save skivol/better-dating-proxy:latest | bzip2 | pv | prod-ssh 'bunzip2 | docker load'"
alias bd-database-transfer-image-to-prod="docker save skivol/better-dating-database:latest | bzip2 | pv | prod-ssh 'bunzip2 | docker load'"
alias bd-transfer-images-to-prod='bd-backend-transfer-image-to-prod && bd-ui-transfer-image-to-prod && bd-proxy-transfer-image-to-prod'
alias bd-rsync-config-to-prod='rsync /d/Downloads/projects/better-dating/docker-compose.yml adm1n@77.120.103.21:/home/adm1n/bd'
alias bd-rsync-pass-to-prod='rsync /d/Downloads/projects/better-dating/.db-password adm1n@77.120.103.21:/home/adm1n/bd'
alias bd-rsync-aliases-to-prod='rsync /d/Downloads/projects/better-dating/aliases/prod-aliases.sh adm1n@77.120.103.21:/home/adm1n/bd'
# https://www.cyberciti.biz/faq/use-bash-aliases-ssh-based-session/
alias bd-prod-deploy="prod-ssh-zsh bd-prod-deploy"
alias bd-prod-ui-build-deploy-update='bd-ui-docker-build && bd-ui-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-frontend'
alias bd-prod-ui-deploy-update='bd-ui-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-frontend'
alias bd-prod-backend-build-deploy-update='bd-backend-build && bd-backend-docker-build && bd-backend-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-backend'
alias bd-prod-proxy-build-deploy-update='bd-proxy-docker-build && bd-proxy-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-proxy'
alias bd-prod-proxy-deploy-update='bd-proxy-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-proxy'
alias bd-prod-database-deploy-update='bd-database-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-database'

# Backup
# Letsencrypt
alias bd-prod-backup-letsencrypt="prod-ssh-zsh bd-prod-backup-letsencrypt-create \
	&& sudo rsync root@77.120.103.21:/home/adm1n/backups/bd-letsencrypt.zip /d/Downloads/projects/better-dating/backup"
# Or https://github.com/prodrigestivill/docker-postgres-backup-local
alias bd-prod-backup-db='prod-ssh-zsh bd-prod-backup-db-dump \
	&& rsync -avz --delete adm1n@77.120.103.21:/home/adm1n/backups/db /d/Downloads/projects/better-dating/backup'
alias bd-prod-backup-all="bd-prod-backup-letsencrypt && bd-prod-backup-db"

# Secrets
# https://stackoverflow.com/questions/42816218/chrome-neterr-cert-common-name-invalid-errors-on-ssl-self-signed-certificate
# https://stackoverflow.com/a/48790088
# https://deanhume.com/testing-service-workers-locally-with-self-signed-certificates/
alias bd-generate-cert='sudo openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -config csr_details.txt'
alias bd-docker-rm-secrets='docker secret rm ssl_certificate ssl_certificate_key'
alias bd-docker-add-cert-key='sudo cat /etc/ssl/private/nginx-selfsigned.key | docker secret create ssl_certificate_key -'
alias bd-docker-add-cert='sudo cat /etc/ssl/certs/nginx-selfsigned.crt | docker secret create ssl_certificate -'

# Prod Status
alias check-docker-status='test `prod-ssh-zsh "date -u; docker ps" | tee /dev/tty | grep "better-dating" | grep "(healthy)" | wc -l` -eq 4 || (echo "Some service seems to be down" && while :; do beep; sleep 1; done)'

# Spring Fu
alias spring-fu-publish-to-local="(wd spring-fu && export GRADLE_USER_HOME=$GRADLE_USER_HOME && ./gradlew -x test -x javadoc build publishToMavenLocal)"
alias spring-fu-build-samples="(wd spring-fu && cd samples && export GRADLE_USER_HOME=$GRADLE_USER_HOME && ./gradlew build)"

alias pnbom='wd proj-ui && rm -rf pnpm-lock.yaml node_modules && pnpm i'

# Git
alias ggpush-fork='git push fork "$(git_current_branch)"'
