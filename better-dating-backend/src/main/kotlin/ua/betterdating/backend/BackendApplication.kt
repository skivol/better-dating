package ua.betterdating.backend

import org.springframework.fu.kofu.reactiveWebApplication
import org.springframework.r2dbc.core.DatabaseClient
import ua.betterdating.backend.configuration.dataConfig
import ua.betterdating.backend.configuration.mailConfig
import ua.betterdating.backend.configuration.webConfig

val app = reactiveWebApplication {
	val passwordFiles = configurationProperties<PasswordFiles>(prefix = "password-files")

	val emailRepository = EmailRepository(lazy { context.getBean(DatabaseClient::class.java) })
	enable(dataConfig(emailRepository, passwordFiles.db))
	enable(mailConfig(passwordFiles.mail))
	enable(webConfig(emailRepository))
}

fun main(args: Array<String>) {
	app.run(args = args)
}
