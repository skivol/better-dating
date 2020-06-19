import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    application
	id("org.springframework.boot") version "2.3.0.RELEASE"
	id("io.spring.dependency-management") version "1.0.9.RELEASE"

	kotlin("jvm") version "1.3.72"
	kotlin("plugin.spring") version "1.3.72"

	// Better checking of dependencies update
	// https://github.com/patrikerdes/gradle-use-latest-versions-plugin
	id("se.patrikerdes.use-latest-versions") version "0.2.14"
	id("com.github.ben-manes.versions") version "0.22.0"

	// Git properties
	id("com.gorylenko.gradle-git-properties") version "2.1.0"
}

group = "ua.betterdating"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

repositories {
	mavenLocal()
	mavenCentral()
	maven(url = uri("https://repo.spring.io/milestone"))
	maven(url = uri("https://repo.spring.io/snapshot"))
}

dependencyManagement {
	imports {
		mavenBom("io.projectreactor:reactor-bom:Bismuth-RELEASE") // https://projectreactor.io/docs/core/release/reference/#getting
		mavenBom("io.netty:netty-bom:4.1.50.Final")
		mavenBom("io.r2dbc:r2dbc-bom:Arabba-RELEASE") // https://github.com/r2dbc/r2dbc-bom (configures "r2dbc-postgresql")
		mavenBom("org.springframework.boot:spring-boot-dependencies:2.3.0.RELEASE")
	}
}

dependencies {
	// DB
    // # Migration
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.flywaydb:flyway-core") // https://github.com/flyway/flyway

    // # Reactive client
	implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
	implementation("io.r2dbc:r2dbc-postgresql") // https://github.com/r2dbc/r2dbc-postgresql
	implementation("org.postgresql:postgresql")

	// Web
	implementation("org.springframework.fu:spring-fu-kofu:skivol-SNAPSHOT")
	implementation("org.springframework.fu:spring-fu-autoconfigure-adapter:skivol-SNAPSHOT")
	implementation("org.springframework.boot:spring-boot-starter-webflux")
	implementation("io.netty:netty-all")
	// # validation
	implementation("org.valiktor:valiktor-core:0.11.0")
	// # json
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

	// Mail
	// # Client
	implementation("org.springframework.boot:spring-boot-starter-mail")
	// # Html template processing
	implementation("org.springframework.boot:spring-boot-starter-freemarker")

	// Kotlin
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
	implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")

	// Test
	testImplementation("org.springframework.boot:spring-boot-starter-test") {
		exclude(module = "junit-vintage-engine")
	}
	testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
	testImplementation("io.projectreactor:reactor-test")
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
