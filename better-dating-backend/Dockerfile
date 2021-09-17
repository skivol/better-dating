# https://unix.stackexchange.com/questions/127076/into-which-directory-should-i-install-programs-in-linux
FROM openjdk:14-jdk-alpine
# https://hub.docker.com/_/alpine/
# https://wiki.alpinelinux.org/wiki/How_to_get_regular_stuff_working
RUN apk add --no-cache curl

# https://docs.docker.com/engine/reference/builder/#healthcheck
COPY ./build/libs/backend-0.0.1-SNAPSHOT.jar /opt/backend.jar

CMD ["sh", "-c", "java -XX:+UnlockExperimentalVMOptions \
      -XX:+UseContainerSupport -XX:InitialRAMPercentage=50.0 \
      -XX:MinRAMPercentage=50.0 -XX:MaxRAMPercentage=75.0 -Dreactor.netty.http.server.accessLogEnabled=true \
      -jar /opt/backend.jar --spring.profiles.active=production \
      --spring.redis.host=bd-redis \
      --spring.security.oauth2.client.registration.facebook.client-id=$FACEBOOK_CLIENT_ID \
      --spring.security.oauth2.client.registration.facebook.client-secret=$FACEBOOK_CLIENT_SECRET \
      --spring.security.oauth2.client.registration.vk.client-id=$VK_CLIENT_ID \
      --spring.security.oauth2.client.registration.vk.client-secret=$VK_CLIENT_SECRET \
      --spring.mail.username=$MAIL_USER --passwordfiles.mail=$MAIL_PASSWORD_FILE \
      --mapbox.public.access-token=$MAPBOX_ACCESS_TOKEN_PUBLIC \
      --mapbox.private.access-token=$MAPBOX_ACCESS_TOKEN_PRIVATE \
      --google.access-token=$GOOGLE_ACCESS_TOKEN \
      --datasource.url=\"r2dbc:postgresql://$DB_HOST/$DB_NAME\" \
      --datasource.username=$DB_USER --passwordfiles.db=$DB_PASSWORD_FILE"]

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
      CMD curl -f http://localhost:8080/actuator/health || exit 1
