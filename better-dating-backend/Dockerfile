# https://unix.stackexchange.com/questions/127076/into-which-directory-should-i-install-programs-in-linux
FROM openjdk:12-alpine
# https://hub.docker.com/_/alpine/
# https://wiki.alpinelinux.org/wiki/How_to_get_regular_stuff_working
RUN apk add --no-cache curl

# https://docs.docker.com/engine/reference/builder/#healthcheck
COPY ./build/libs/backend-0.0.1-SNAPSHOT.jar /opt/backend.jar
CMD ["sh", "-c", "java -jar /opt/backend.jar --spring.profiles.active=production --spring.mail.username=$MAIL_USER --spring.mail.passwordfile=$MAIL_PASSWORD_FILE --spring.datasource.url=$DB_URL --spring.datasource.username=$DB_USER --spring.datasource.passwordfile=$DB_PASSWORD_FILE"]

HEALTHCHECK --interval=1m --timeout=10s --retries=3 --start-period=45s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
