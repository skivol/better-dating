package ua.betterdating.backend

import org.springframework.boot.WebApplicationType
import org.springframework.boot.autoconfigure.data.r2dbc.PostgresqlR2dbcProperties
import org.springframework.fu.kofu.application
import org.springframework.fu.kofu.flyway.flyway
import org.springframework.fu.kofu.freemarker.freeMarker
import org.springframework.fu.kofu.mail.mail
import org.springframework.fu.kofu.r2dbc.r2dbcPostgresql
import java.io.File
import java.time.Duration
import java.time.temporal.ChronoUnit

val app = application(WebApplicationType.REACTIVE) {
	enable(dataConfig)
	enable(webConfig)

	if (profiles.contains("development") || profiles.contains("production")) {
		val passwordfilesProperties = configurationProperties<PasswordfilesProperties>(prefix = "passwordfiles")
		mail {
			password = readPassword(profiles, passwordfilesProperties.mail)
		}

		val dbPassword = readPassword(profiles, passwordfilesProperties.db)
		val postgresqlR2dbcProperties = configurationProperties<PostgresqlR2dbcProperties>(prefix = "datasource")
		r2dbcPostgresql {
			host = postgresqlR2dbcProperties.host
			database = postgresqlR2dbcProperties.database
			username = postgresqlR2dbcProperties.username
			password = dbPassword
			connectTimeout = Duration.of(30, ChronoUnit.SECONDS)
		}

		flyway {
			url = "jdbc:postgresql://${postgresqlR2dbcProperties.host}/${postgresqlR2dbcProperties.database}"
			user = postgresqlR2dbcProperties.username
			password = dbPassword
		}
	}

	freeMarker()
}

private fun readPassword(profiles: Array<String>, path: String) = if (profiles.contains("test")) "" else File(path).readText().trim()

fun main(args: Array<String>) {
	app.run(args = args)
}
