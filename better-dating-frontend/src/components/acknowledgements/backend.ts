import { Licenses } from "./licenses";

export const libraries = [
  {
    name: "Spring Boot",
    url: "https://github.com/spring-projects/spring-boot",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Flyway",
    url: "https://github.com/flyway/flyway",
    license: Licenses.APACHE,
    copyright: "Copyright 2010-2020 Redgate Software Ltd",
  },
  {
    name: "PostgreSQL R2DBC Driver",
    url: "https://github.com/pgjdbc/r2dbc-postgresql",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Spring Fu",
    url: "https://github.com/spring-projects-experimental/spring-fu",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Spring Fu (fork)",
    url: "https://github.com/skivol/spring-fu/tree/feature/skivol-snapshot",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Netty Project",
    url: "https://github.com/netty/netty",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Spring Session",
    url: "https://github.com/spring-projects/spring-session",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Lettuce - Advanced Java Redis client",
    url: "https://github.com/lettuce-io/lettuce-core",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Valiktor",
    url: "https://github.com/valiktor/valiktor",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "jackson-module-kotlin",
    url: "https://github.com/FasterXML/jackson-module-kotlin",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Apache FreeMarker",
    url: "https://github.com/apache/freemarker",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "kotlinx.coroutines",
    url: "https://github.com/Kotlin/kotlinx.coroutines",
    license: Licenses.APACHE,
    copyright:
      "Copyright 2000-2020 JetBrains s.r.o. and Kotlin Programming Language contributors.",
  },
  {
    name: "JUnit 5",
    url: "https://github.com/junit-team/junit5",
    license: Licenses.ECLIPSE,
    copyright: null,
  },
];

export const tools = [
  {
    name: "Kotlin Programming Language",
    url: "https://github.com/JetBrains/kotlin",
    license: Licenses.APACHE,
    copyright:
      "Copyright 2000-2020 JetBrains s.r.o. and Kotlin Programming Language contributors.",
  },
  {
    name: "Gradle",
    url: "https://github.com/gradle/gradle",
    license: Licenses.APACHE,
    copyright: null,
  },
  {
    name: "Класифікатор об’єктів адміністративно-територіального устрою України (КОАТУУ)",
    url: "https://data.gov.ua/dataset/dc081fb0-f504-4696-916c-a5b24312ab6e",
    description: "Основа для базы населенных пунктов Украины",
    license: Licenses.CREATIVE_COMMONS,
  },
];

export const infrastructure = [
  {
    name: "PostgreSQL Database Management System",
    url: "https://github.com/postgres/postgres",
    license: Licenses.POSTGRES,
    copyright: [
      "Portions Copyright © 1996-2020, The PostgreSQL Global Development Group",
      "Portions Copyright © 1994, The Regents of the University of California",
    ],
  },
  {
    name: "Redis",
    url: "https://github.com/redis/redis",
    license: Licenses.BSD_3,
    copyright: "Copyright (c) 2006-2020, Salvatore Sanfilippo",
  },
  {
    name: "nginx",
    url: "https://github.com/nginx/nginx",
    license: Licenses.NGINX,
    copyright: [
      "Copyright (C) 2002-2020 Igor Sysoev",
      "Copyright (C) 2011-2020 Nginx, Inc.",
    ],
  },
  {
    name: "Docker CE",
    url: "https://github.com/docker/docker-ce",
    license: Licenses.APACHE,
    copyright: "Copyright 2013-2017 Docker, Inc.",
  },
  {
    name: "CentOS",
    url: "https://www.centos.org/",
    license: { name: "CentOS Legal", url: "https://www.centos.org/legal/" },
    copyright: null,
  },
  {
    name: "Дата-центр ВОЛЯ",
    url: "https://dc.volia.com/ru",
    license: null,
    copyright: null,
  },
  {
    name: "UptimeRobot",
    url: "https://uptimerobot.com/",
    license: null,
    copyright: null,
  },
];

export const thirdPartyServicesAndResources = [
  {
    name: "Mapbox",
    url: "https://www.mapbox.com/",
    description: "Отображение карт, геокодирование, обратное геокодирование",
  },
  {
    name: "Google Timezone Api",
    url: "https://developers.google.com/maps/documentation/timezone/overview",
    description: "Определение временных зон",
  },
];
