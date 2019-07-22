# https://unix.stackexchange.com/questions/127076/into-which-directory-should-i-install-programs-in-linux
FROM openjdk:12-alpine
COPY ./build/libs/backend-0.0.1-SNAPSHOT.jar /opt/backend.jar
CMD ["sh", "-c", "java -jar /opt/backend.jar --spring.profiles.active=production --spring.mail.username=$MAIL_USER --spring.mail.password=$MAIL_PASSWORD --spring.datasource.url=$DB_URL --spring.datasource.username=$DB_USER --spring.datasource.password=$DB_PASSWORD"]
