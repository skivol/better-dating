package ua.betterdating.backend

import io.r2dbc.spi.ConnectionFactoryOptions
import org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryOptionsBuilderCustomizer
import org.springframework.boot.autoconfigure.r2dbc.R2dbcProperties
import org.springframework.fu.kofu.flyway.flyway
import org.springframework.fu.kofu.freemarker.freeMarker
import org.springframework.fu.kofu.mail.mail
import org.springframework.fu.kofu.r2dbc.r2dbc
import org.springframework.fu.kofu.reactiveWebApplication
import java.io.File
import java.time.Duration
import java.time.temporal.ChronoUnit

val app = reactiveWebApplication {
	enable(dataConfig)
	enable(webConfig)

	if (profiles.contains("development") || profiles.contains("production")) {
		val passwordFiles = configurationProperties<PasswordFiles>(prefix = "password-files")
		mail {
			password = readPassword(profiles, passwordFiles.mail)
		}

		val dbPassword = readPassword(profiles, passwordFiles.db)
		val r2dbcProperties = configurationProperties<R2dbcProperties>(prefix = "datasource")
		r2dbc {
			url = r2dbcProperties.url
			username = r2dbcProperties.username
			password = dbPassword
            optionsCustomizer = listOf(ConnectionFactoryOptionsBuilderCustomizer {
				it.option(ConnectionFactoryOptions.CONNECT_TIMEOUT, Duration.of(30, ChronoUnit.SECONDS))
			})
			transactional = true
		}

		flyway {
			url = r2dbcProperties.url.replace("r2dbc:", "jdbc:")
			user = r2dbcProperties.username
			password = dbPassword
		}
	}

	freeMarker()
}

private fun readPassword(profiles: Array<String>, path: String) = if (profiles.contains("test")) "" else File(path).readText().trim()

fun main(args: Array<String>) {
	app.run(args = args)
}
