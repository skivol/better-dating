import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    application
	id("org.springframework.boot") version "2.2.2.RELEASE"
	id("io.spring.dependency-management") version "1.0.8.RELEASE"

	kotlin("jvm") version "1.3.61"
	kotlin("plugin.spring") version "1.3.61"

	// Better checking of dependencies update
	// https://github.com/patrikerdes/gradle-use-latest-versions-plugin
	id("se.patrikerdes.use-latest-versions") version "0.2.12"
	id("com.github.ben-manes.versions") version "0.22.0"

	// Git properties
	id("com.gorylenko.gradle-git-properties") version "2.1.0"
}

group = "ua.betterdating"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_1_8

repositories {
	mavenLocal()
	mavenCentral()
	maven(url = uri("https://repo.spring.io/milestone"))
	maven(url = uri("https://repo.spring.io/snapshot"))
}

dependencyManagement {
	imports {
		mavenBom("io.r2dbc:r2dbc-bom:Arabba-RC1")
	}
}

dependencies {
	// DB
	implementation("org.springframework.data:spring-data-r2dbc:1.0.0.RC1")
	implementation("io.r2dbc:r2dbc-postgresql")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.flywaydb:flyway-core")
	implementation("org.postgresql:postgresql")

	// Web
	implementation("org.springframework.fu:spring-fu-kofu:0.3.BUILD-SNAPSHOT-skivol")
	implementation("org.springframework.fu:spring-fu-autoconfigure-adapter:0.3.BUILD-SNAPSHOT-skivol")
	implementation("org.springframework.boot:spring-boot-starter-webflux")
	implementation("io.netty:netty-all:4.1.39.Final")
	implementation("am.ik.yavi:yavi:0.2.0")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

	// Mail
	implementation("org.springframework.boot:spring-boot-starter-mail")
	implementation("org.springframework.boot:spring-boot-starter-freemarker")

	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
	implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")

	// Test
	testImplementation("org.springframework.boot:spring-boot-starter-test") {
		exclude(module = "junit")
	}
	testImplementation("org.junit.jupiter:junit-jupiter-api")
	testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
	testCompile("io.projectreactor:reactor-test")
	testImplementation("com.ninja-squad:springmockk:1.1.2")
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		jvmTarget = "1.8"
		freeCompilerArgs = listOf("-Xjsr305=strict", "-Xjvm-default=enable")
	}
}

tasks.withType<Test> {
  useJUnitPlatform()
}

configurations.all {
	exclude(module = "jakarta.validation-api")
	exclude(module = "hibernate-validator")
}

application {
	mainClassName = "ua.betterdating.backend.BackendApplicationKt"
	// https://stackoverflow.com/questions/47091669/how-to-turn-on-the-access-log-for-spring-webflux
	// TODO use startup scripts ? https://docs.gradle.org/current/userguide/application_plugin.html
	applicationDefaultJvmArgs = listOf("-Dreactor.netty.http.server.accessLogEnabled=true")
}
