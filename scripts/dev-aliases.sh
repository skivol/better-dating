# Example usage in ~/.zshrc:
#
# source ~/projects/better-dating/scripts/dev-aliases.sh
# Prerequisites: wd points (in, for example, WSL2)
#  * All warp points:
#     projects  ->  ~/projects
#         proj  ->  ~/projects/better-dating
#      proj-ui  ->  ~/projects/better-dating/better-dating-frontend
# proj-backend  ->  ~/projects/better-dating/better-dating-backend
#   proj-proxy  ->  ~/projects/better-dating/better-dating-proxy
#      proj-db  ->  ~/projects/better-dating/better-dating-database
#   proj-cache  ->  ~/projects/better-dating/better-dating-caching
#
# --> some of these aliases depend on extra variables, see .shell-variables-template
# --> "WSL 2 consumes massive amounts of RAM and doesn't return it" https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261

bd-ui-server() {
	wd proj-ui && export $(grep -v "^#" ../.env-dev | xargs) && NEXT_APP_UPDATED="$(date -u --iso-8601=seconds)" pnpm run dev
}
alias bd-ui-test='wd proj-ui && pnpm run test'
bd-ui-build() {
	wd proj-ui && export $(grep -v "^#" ../.env-dev | xargs) && NEXT_APP_UPDATED="$(date -u --iso-8601=seconds)" pnpm run build
}
alias bd-ui-docker-build='wd proj-ui && DOCKER_BUILDKIT=1 docker build -t skivol/better-dating-ui:latest . && docker image prune -f --filter label=stage=builder'
alias bd-ui-docker-run='docker run --rm --name better-dating-ui -d -p 8080:80 skivol/better-dating-ui:latest'
alias bd-ui-docker-stop='docker stop better-dating-ui'
alias bd-ui-view='firefox http://localhost:3000/предложение'
alias bd-prod-view='firefox https://смотрины.укр'
alias bd-backend-docker-build='wd proj-backend && DOCKER_BUILDKIT=1 docker build -t skivol/better-dating-backend:latest .'
alias bd-backend-docker-run='docker run --name better-dating-backend -d -p 8080:8080 skivol/better-dating-backend:latest'
alias bd-backend-docker-start='docker start better-dating-backend'
alias bd-backend-docker-stop='docker stop better-dating-backend'
alias bd-proxy-docker-build='wd proj-proxy && DOCKER_BUILDKIT=1 docker build -t skivol/better-dating-proxy:latest .'
alias bd-database-docker-build='wd proj-db && DOCKER_BUILDKIT=1 docker build -t skivol/better-dating-database:latest .'
alias bd-cache-docker-build='wd proj-cache && DOCKER_BUILDKIT=1 docker build -t skivol/better-dating-cache:latest .'

# Vim
alias bd-ui-vim='wd proj-ui && vim'
alias bd-backend-vim='wd proj-backend && vim'
alias bd-vim='wd proj && vim -p better-dating-backend better-dating-frontend'

alias bd-backend-gradle="wd proj-backend && ./gradlew"
alias bd-backend-build='bd-backend-gradle build'
alias bd-backend-compile='bd-backend-gradle compileJava'
alias bd-backend-test='bd-backend-gradle test'
alias bd-backend-test-compile='bd-backend-gradle testClasses'
alias bd-backend-update-deps='bd-backend-gradle useLatestVersions'
# https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/html/#running-your-application-passing-arguments
bd-backend-server-impl() {
	( # https://www.tldp.org/LDP/abs/html/subshells.html
		wd proj
		export $(grep -v "^#" .env-dev | xargs)
		programArgs=$(echo "--spring.profiles.active=$1 --spring.mail.username=$BD_MAIL_USER \
							--spring.security.oauth2.client.registration.facebook.client-id=$FACEBOOK_CLIENT_ID \
							--spring.security.oauth2.client.registration.facebook.client-secret=$FACEBOOK_CLIENT_SECRET \
							--spring.security.oauth2.client.registration.vk.client-id=$VK_CLIENT_ID \
							--spring.security.oauth2.client.registration.vk.client-secret=$VK_CLIENT_SECRET \
							--mapbox.public.access-token=$MAPBOX_ACCESS_TOKEN_PUBLIC \
							--mapbox.private.access-token=$MAPBOX_ACCESS_TOKEN_PRIVATE \
							--google.access-token=$GOOGLE_ACCESS_TOKEN \
							--password-files.mail=$BD_MAIL_PASSWORD_FILE \
							--datasource.username=$BD_DB_USER \
							--datasource.url=r2dbc:postgresql://localhost/$BD_DB \
							--password-files.db=$BD_DB_PASSWORD_FILE" | tr -d '\t'); # tabs really mess up spring args
		bd-backend-gradle run ${@:2} --args="$programArgs"
	)
}
bd-backend-server() {
	bd-backend-server-impl development $*
}
bd-backend-server-with-mail() {
	bd-backend-server-impl "development,mail" $*
}

alias bd-backend-debug='bd-backend-server --debug-jvm'
alias bd-backend-with-mail-debug='bd-backend-server-with-mail --debug-jvm'
alias bd-backend-test-results='wd proj-backend && firefox build/reports/tests/test/index.html'
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

# https://hub.docker.com/_/postgres
bd-db-run() {
  docker run --name bd-db --publish 5432:5432 -e POSTGRES_PASSWORD=postgres -e PGDATA=/pgdata -d -v bd-db-data:/pgdata $* skivol/better-dating-database:latest
}
alias bd-db-run-rm='bd-db-run --rm'
alias bd-db-stop='docker stop bd-db'
alias bd-db-restart='bd-db-stop && bd-db-run'
## Psql docs: https://www.postgresql.org/docs/current/app-psql.html
## https://stackoverflow.com/questions/37099564/docker-how-can-run-the-psql-command-in-the-postgres-container
## Describe table: https://stackoverflow.com/questions/109325/postgresql-describe-table
## Dump table schema: https://stackoverflow.com/questions/2593803/how-to-generate-the-create-table-sql-statement-for-an-existing-table-in-postgr
### https://www.postgresql.org/docs/current/app-pgdump.html
alias psql='docker exec -it bd-db psql -d postgres -U postgres -w'
# alias psql='docker run --rm --name psql --link bd-db:bd-db -it postgres:alpine psql -h bd-db -U bd-user better-dating'
# https://stackoverflow.com/questions/41847656/network-not-manually-attachable-when-running-one-off-command-against-docker-sw
alias prod-psql='docker run --rm --name prod-psql --network better-dating_default --link better-dating_bd-postgres:better-dating_bd-postgres -it postgres:alpine psql -h better-dating_bd-postgres -U postgres postgres'

alias bd-cache-run='docker run --rm --name bd-cache -d -p 6379:6379 skivol/better-dating-cache:latest'
alias bd-cache-stop='docker stop bd-cache'

alias prod-ssh="ssh $PROD_USER@$PROD"
prod-ssh-zsh() {
	prod-ssh "/bin/zsh -ic '$*'"
}
# https://stackoverflow.com/a/26226261
transfer-image() {
	docker save "skivol/better-dating-${1}:latest" | bzip2 | pv | prod-ssh 'bunzip2 | docker load'
}
alias bd-backend-transfer-image-to-prod="transfer-image backend"
alias bd-ui-transfer-image-to-prod="transfer-image ui"
alias bd-proxy-transfer-image-to-prod="transfer-image proxy"
alias bd-database-transfer-image-to-prod="transfer-image database"
alias bd-cache-transfer-image-to-prod="transfer-image cache"

rsync-to-bd() {
	rsync $PROJECTS/better-dating/$1 $PROD_USER@$PROD:/home/$PROD_USER/bd/
}
alias bd-rsync-config-to-prod="rsync-to-bd docker-compose.yml"
alias bd-rsync-aliases-to-prod="rsync-to-bd scripts/prod-aliases.sh"
alias bd-rsync-troubleshooting-to-prod="rsync-to-bd scripts/troubleshooting.sh"
alias bd-rsync-status-check-to-prod="rsync-to-bd scripts/status-check.sh"
alias bd-rsync-env-to-prod="rsync-to-bd .env-prod"
alias bd-rsync-cert-update-to-prod="rsync-to-bd scripts/certificate-update.sh"

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
	&& sudo rsync root@$PROD:/home/$PROD_USER/backups/bd-letsencrypt.zip $BACKUP"
# Or https://github.com/prodrigestivill/docker-postgres-backup-local
alias bd-prod-backup-db="prod-ssh-zsh bd-prod-backup-db-dump \
	&& rsync -avz --delete $PROD_USER@$PROD:/home/$PROD_USER/bd/backups/db $BACKUP"
alias bd-prod-backup-all="bd-prod-backup-letsencrypt && bd-prod-backup-db"

# Secrets
# https://stackoverflow.com/questions/42816218/chrome-neterr-cert-common-name-invalid-errors-on-ssl-self-signed-certificate
# https://stackoverflow.com/a/48790088
# https://deanhume.com/testing-service-workers-locally-with-self-signed-certificates/
alias bd-docker-rm-secrets='docker secret rm ssl_certificate ssl_certificate_key dhparam'
alias bd-generate-cert='wd proj && sudo openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -config csr_details.txt'
alias bd-docker-add-cert-key='sudo cat /etc/ssl/private/nginx-selfsigned.key | docker secret create ssl_certificate_key -'
alias bd-docker-add-cert='sudo cat /etc/ssl/certs/nginx-selfsigned.crt | docker secret create ssl_certificate -'
alias bd-generate-dhparam='sudo openssl dhparam -out /etc/nginx/ssl/dhparam-2048.pem 2048'
alias bd-docker-add-dhparam='sudo cat /etc/nginx/ssl/dhparam-2048.pem | docker secret create dhparam -'
alias bd-docker-add-db-password='wd proj && cat .db-password | docker secret create db_password -'
alias bd-docker-add-mail-password='wd proj && cat .mail-password | docker secret create mail_password -'

# Prod Status
alias check-docker-status='test `prod-ssh-zsh "date -u; docker ps" | tee /dev/tty | grep "better-dating" | grep "(healthy)" | wc -l` -eq 4 || (echo "Some service seems to be down" && while :; do beep; sleep 1; done)'

# Spring Fu
alias spring-fu-publish-to-local="(wd spring-fu && ./gradlew -x test -x javadoc build publishToMavenLocal)"
alias spring-fu-build-samples="(wd spring-fu && cd samples && ./gradlew build)"
alias gfs='git fetch spring'

alias pnbom='wd proj-ui && rm -rf pnpm-lock.yaml node_modules && pnpm i'

# Git
alias ggpush-fork='git push fork "$(git_current_branch)"'

# Troubleshooting
troubleshooting-logout() {
	echo "Disable browser cache!"
}
troubleshooting-dns() {
	local url="https://letsdebug.net/xn--h1aheckdj9e.xn--j1amh"
	echo "Test on $url"
	open-in-browser $url
}

# Restore dump
# https://dba.stackexchange.com/questions/76417/restoring-postgres-database-pg-restore-vs-just-using-psql
alias bd-prod-backup-db-list='ls -l --sort=newest $(zq backup/db)'
bd-prod-backup-db-restore() {
	cat $(zq backup/db)/$1 | gunzip | docker exec -i $(docker ps --filter "name=bd-db" --format "{{.Names}}") psql -h localhost -U postgres
}

# Api utils
sessionId="bd-login"
bd-http() {
	http --session=$sessionId $*
}
backend="localhost:8080"
api-user-profile-create() {
	http POST $backend/api/user/profile \
	  X-XSRF-TOKEN:$1 \
	  "Cookie:XSRF-TOKEN=$1; Path=/" \
	  acceptTerms:=true \
	  email=$2 \
	  nickname=$3 \
	  gender=$4 \
	  birthday=$5 \
	  height:=$6 \
	  weight:=$7 \
	  physicalExercise=$8 \
	  smoking=$9 \
	  alcohol=${10} \
	  computerGames=${11} \
	  gambling=${12} \
	  haircut=${13} \
	  hairColoring=${14} \
	  makeup=${15} \
	  intimateRelationsOutsideOfMarriage=${16} \
	  pornographyWatching=${17} \
	  personalHealthEvaluation:=${18}
}

api-user-profile-update() {
	bd-http PUT $backend/api/user/profile \
	  X-XSRF-TOKEN:$1 \
	  "Cookie:XSRF-TOKEN=$1; Path=/" \
	  email=$2 \
	  nickname=$3 \
	  gender=$4 \
	  birthday=$5 \
	  height:=$6 \
	  weight:=$7 \
	  physicalExercise=$8 \
	  smoking=$9 \
	  alcohol=${10} \
	  computerGames=${11} \
	  gambling=${12} \
	  haircut=${13} \
	  hairColoring=${14} \
	  makeup=${15} \
	  intimateRelationsOutsideOfMarriage=${16} \
	  pornographyWatching=${17} \
	  personalHealthEvaluation:=${18}
}

api-user-email-verify() {
	bd-http POST $backend/api/user/email/verify \
	    X-XSRF-TOKEN:$1 \
	    "Cookie:XSRF-TOKEN=$1; Path=/" \
	    token=$2
}

api-auth-login-link() {
	http POST $backend/api/auth/login-link \
	    X-XSRF-TOKEN:$1 \
	    "Cookie:XSRF-TOKEN=$1; Path=/" \
	    email=$2
}

api-auth-login() {
	bd-http POST $backend/api/auth/login \
	  X-XSRF-TOKEN:$1 \
	  "Cookie:XSRF-TOKEN=$1; Path=/" \
	  token=$2
}

api-auth-me() {
	bd-http $backend/api/auth/me
}

api-user-profile-activate-second-stage() {
	bd-http POST $backend/api/user/profile/activate-second-stage \
	  X-XSRF-TOKEN:$1 \
	  "Cookie:XSRF-TOKEN=$1; Path=/" \
	  goal=$2 \
	  populatedLocality:=$3 \
	  nativeLanguages:=$4 \
	  eyeColor=$5 \
	  interests:=$6 \
	  likedPersonalQualities:=$7 \
	  dislikedPersonalQualities:=$8 \
	  appearanceType=$9 \
	  naturalHairColor=${10} \
	  participateInAutomatedPairMatchingAndDateOrganization=${11}
}

api-user-profile() {
	bd-http $backend/api/user/profile
}

actuator-health() {
	http $backend/actuator/health
}

api-user-email-contact() {
	http $backend/api/user/email/contact
}


