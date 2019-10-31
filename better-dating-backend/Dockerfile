# https://unix.stackexchange.com/questions/127076/into-which-directory-should-i-install-programs-in-linux
FROM openjdk:12-alpine
# https://hub.docker.com/_/alpine/
# https://wiki.alpinelinux.org/wiki/How_to_get_regular_stuff_working
RUN apk add --no-cache curl

# https://docs.docker.com/engine/reference/builder/#healthcheck
COPY ./build/libs/backend-0.0.1-SNAPSHOT.jar /opt/backend.jar
CMD ["sh", "-c", "java -jar -Dreactor.netty.http.server.accessLogEnabled=true /opt/backend.jar --spring.profiles.active=production --spring.mail.username=$MAIL_USER --passwordfiles.mail=$MAIL_PASSWORD_FILE --datasource.host=$DB_HOST --datasource.database=$DB_NAME --datasource.username=$DB_USER --passwordfiles.db=$DB_PASSWORD_FILE"]

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
