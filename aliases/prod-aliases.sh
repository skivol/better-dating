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
# https://stackoverflow.com/questions/51104049/unable-to-create-docker-secret-with-stdin
alias bd-prod-docker-add-secret-certificate='sudo cat /etc/letsencrypt/live/xn--h1aheckdj9e.xn--j1amh/fullchain.pem | docker secret create ssl_certificate -'
alias bd-prod-docker-add-secret-key='sudo cat /etc/letsencrypt/live/xn--h1aheckdj9e.xn--j1amh/privkey.pem | docker secret create ssl_certificate_key -'
alias bd-prod-proxy-add-secrets='docker service update better-dating_bd-reverse-proxy --secret-add ssl_certificate --secret-add ssl_certificate_key'
alias bd-prod-proxy-start='docker service scale better-dating_bd-reverse-proxy=1'
alias bd-prod-proxy-logs='docker service logs /better-dating_bd-reverse-proxy'
alias bd-prod-backend-logs='docker service logs /better-dating_bd-backend'
alias bd-prod-ui-logs='docker service logs /better-dating_bd-ui'
alias bd-prod-db-logs='docker service logs /better-dating_bd-postgres'

# https://forums.docker.com/t/rolling-update-with-same-tag/19400/5
alias bd-prod-update-frontend='docker service update --env-add "UPDATE_DATE=$(date)" better-dating_bd-frontend'
