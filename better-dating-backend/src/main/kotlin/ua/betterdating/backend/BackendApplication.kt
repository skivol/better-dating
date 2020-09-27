package ua.betterdating.backend

import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.fu.kofu.reactiveWebApplication
import ua.betterdating.backend.configuration.dataConfig
import ua.betterdating.backend.configuration.mailConfig
import ua.betterdating.backend.configuration.webConfig

val app = reactiveWebApplication {
	val passwordFiles = configurationProperties<PasswordFiles>(prefix = "password-files")

	val emailRepository = EmailRepository(lazy { context.getBean(R2dbcEntityTemplate::class.java) })
	val userRoleRepository = UserRoleRepository(lazy { context.getBean(R2dbcEntityTemplate::class.java) })
	enable(dataConfig(emailRepository, userRoleRepository, passwordFiles.db))
	enable(mailConfig(passwordFiles.mail))
	enable(webConfig(emailRepository, userRoleRepository))
}

fun main(args: Array<String>) {
	app.run(args = args)
}
