# Example usage in ~/.zshrc:
# source /d/Downloads/projects/better-dating/aliases/dev-aliases.sh
# Prerequisites: wd points
#  * All warp points:
#     projects  ->  /d/Downloads/projects
#         proj  ->  /d/Downloads/projects/better-dating
#      proj-ui  ->  /d/Downloads/projects/better-dating/better-dating-frontend
# proj-backend  ->  /d/Downloads/projects/better-dating/better-dating-backend
#   proj-proxy  ->  /d/Downloads/projects/better-dating/better-dating-proxy


bd-ui-server() {
	wd proj-ui && REACT_APP_UPDATED="$(date)" yarn start
}
alias bd-ui-test='wd proj-ui && yarn test'
# export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser && 
# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#alternative-setup-setuid-sandbox
# export CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox && 
bd-ui-build() {
	wd proj-ui && REACT_APP_UPDATED="$(date)" yarn build
}
# alias bd-ui-build-snap='wd proj-ui && yarn build-snap'
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
# https://www.freecodecamp.org/news/make-your-vim-smarter-using-ctrlp-and-ctags-846fc12178a4/
alias bd-tags='wd proj && ctags -R .'

alias bd-backend-gradle='wd proj-backend && ./gradlew'
alias bd-backend-build='bd-db-stop; bd-db-run && bd-backend-gradle build; bd-db-stop'
alias bd-backend-compile='bd-backend-gradle compileJava'
alias bd-backend-test='bd-db-run && bd-backend-gradle test; bd-db-stop'
alias bd-backend-test-compile='bd-backend-gradle testClasses'
alias bd-backend-update-deps='bd-backend-gradle useLatestVersions'
# https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/html/#running-your-application-passing-arguments
alias bd-backend-server='(wd proj && export $(grep -v "^#" .env-dev | xargs) && bd-backend-gradle bootRun --args="--spring.mail.username=$BD_MAIL_USER --spring.mail.passwordfile=$BD_MAIL_PASSWORD_FILE --spring.datasource.username=$BD_DB_USER --spring.datasource.passwordfile=$BD_DB_PASSWORD_FILE")'
alias bd-backend-test-results='wslview "D:\Downloads\projects\better-dating\better-dating-backend\build\reports\tests\test\index.html"'
alias bd-build='bd-backend-build && bd-ui-build'
alias bd-docker-build='bd-backend-docker-build && bd-ui-docker-build && bd-proxy-docker-build'
# alias bd-start='wd proj && docker-compose up -d'
# alias bd-stop='wd proj && docker-compose down --volume'
alias bd-deploy='wd proj && env $(grep -v "^#" .env-dev | xargs) docker stack deploy --compose-file docker-compose.yml better-dating'
alias bd-stop='docker service scale better-dating_bd-reverse-proxy=0 better-dating_bd-backend=0 better-dating_bd-frontend=0 better-dating_bd-postgres=0'
alias bd-start='docker service scale better-dating_bd-reverse-proxy=1 better-dating_bd-backend=1 better-dating_bd-frontend=1 better-dating_bd-postgres=1'
alias bd-rm='docker stack rm better-dating'
# https://stackoverflow.com/questions/19331497/set-environment-variables-from-file-of-key-pair-values
# export $(cat .env | xargs) &&
# env $(cat .env | xargs) docker
alias docker-cleanup-images='docker rmi $(docker images -f "dangling=true" -q)'
# https://docs.docker.com/engine/reference/commandline/rm/
alias docker-cleanup-containers='docker rm $(docker ps -a -q)'
# https://linuxize.com/post/how-to-remove-docker-images-containers-volumes-and-networks/
alias docker-cleanup-everything='docker system prune --volumes --force'

gradleIndex=~/projects/gradle-index.txt
# https://stackoverflow.com/questions/21212060/search-or-list-java-classes-in-classpath-ncluding-jars-via-command-line
# https://stackoverflow.com/questions/10834111/gradle-store-on-local-file-system#comment50138183_10834567
alias gradle-index-refresh="find ~/.gradle/caches/modules-2/files-2.1 -name \"*.jar\" -exec jar -tf {} \; > $gradleIndex"
alias gradle-index-view="vim $gradleIndex"
gradle-index-grep() {
	grep "/\($1\)\.class\$" $gradleIndex
}

alias idea='/c/Program\ Files\ \(x86\)/JetBrains/IntelliJ\ IDEA\ Community\ Edition\ 2019.1.1/bin/idea64.exe'

# https://hub.docker.com/_/postgres
alias bd-db-run='docker run --name bd-db --publish 5432:5432 -d --rm postgres:alpine'
alias bd-db-stop='docker stop bd-db'
## Psql docs: https://www.postgresql.org/docs/current/app-psql.html
## https://stackoverflow.com/questions/37099564/docker-how-can-run-the-psql-command-in-the-postgres-container
## Describe table: https://stackoverflow.com/questions/109325/postgresql-describe-table
## Dump table schema: https://stackoverflow.com/questions/2593803/how-to-generate-the-create-table-sql-statement-for-an-existing-table-in-postgr
### https://www.postgresql.org/docs/current/app-pgdump.html
alias psql='docker exec -it bd-db psql -d postgres -U postgres -w'
# alias psql='docker run --rm --name psql --link bd-db:bd-db -it postgres:alpine psql -h bd-db -U bd-user better-dating'
# https://stackoverflow.com/questions/41847656/network-not-manually-attachable-when-running-one-off-command-against-docker-sw
alias prod-psql='docker run --rm --name prod-psql --network better-dating_default --link better-dating_bd-postgres:better-dating_bd-postgres -it postgres:alpine psql -h better-dating_bd-postgres -U bd-user better-dating'

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
alias bd-transfer-images-to-prod='bd-backend-transfer-image-to-prod && bd-ui-transfer-image-to-prod && bd-proxy-transfer-image-to-prod'
alias bd-rsync-config-to-prod='rsync /d/Downloads/projects/better-dating/docker-compose.yml adm1n@77.120.103.21:/home/adm1n/bd'
alias bd-rsync-aliases-to-prod='rsync /d/Downloads/projects/better-dating/aliases/prod-aliases.sh adm1n@77.120.103.21:/home/adm1n/bd'
# https://www.cyberciti.biz/faq/use-bash-aliases-ssh-based-session/
alias bd-prod-deploy="prod-ssh-zsh bd-prod-deploy"
alias bd-prod-ui-build-deploy-update='bd-ui-docker-build && bd-ui-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-frontend'
alias bd-prod-backend-build-deploy-update='bd-backend-build && bd-backend-docker-build && bd-backend-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-backend'
alias bd-prod-proxy-build-deploy-update='bd-proxy-docker-build && bd-proxy-transfer-image-to-prod && prod-ssh-zsh bd-prod-update-proxy'

# Backup
# Letsencrypt
alias bd-prod-backup-letsencrypt="prod-ssh-zsh bd-prod-backup-letsencrypt-create \
	&& sudo rsync root@77.120.103.21:/home/adm1n/backups/bd-letsencrypt.zip /d/Downloads/projects/better-dating/backup"
# Or https://github.com/prodrigestivill/docker-postgres-backup-local
alias bd-prod-backup-db='prod-ssh-zsh bd-prod-backup-db-dump \
	&& rsync -avz --delete adm1n@77.120.103.21:/home/adm1n/backups/db /d/Downloads/projects/better-dating/backup'
alias bd-prod-backup-all="bd-prod-backup-letsencrypt && bd-prod-backup-db"
