package ua.betterdating.backend

import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.fu.kofu.reactiveWebApplication
import org.springframework.fu.kofu.scheduling.scheduling
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import ua.betterdating.backend.configuration.dataConfig
import ua.betterdating.backend.configuration.loggingConfig
import ua.betterdating.backend.configuration.mailConfig
import ua.betterdating.backend.configuration.webConfig
import ua.betterdating.backend.data.EmailRepository
import ua.betterdating.backend.data.LoginInformationRepository
import ua.betterdating.backend.data.UserRoleRepository
import ua.betterdating.backend.tasks.DateOrganizingTask
import ua.betterdating.backend.tasks.OverdueDateHandlerTask
import ua.betterdating.backend.tasks.PairMatcherTask
import java.util.concurrent.Executors

val app = reactiveWebApplication {
	val passwordFiles = configurationProperties<PasswordFiles>(prefix = "password-files")

	val emailRepository = EmailRepository(lazy { context.getBean(R2dbcEntityTemplate::class.java) })
	val userRoleRepository = UserRoleRepository(lazy { context.getBean(R2dbcEntityTemplate::class.java) })
	val loginInformationRepository = LoginInformationRepository(
		lazy { context.getBean(R2dbcEntityTemplate::class.java) },
		lazy { context.getBean(DatabaseClient::class.java) }
	)
	enable(dataConfig(emailRepository, userRoleRepository, loginInformationRepository, passwordFiles.db))
	enable(mailConfig(passwordFiles.mail))
	enable(webConfig(emailRepository, userRoleRepository, loginInformationRepository))
	enable(loggingConfig())

	scheduling {
		taskScheduler = ConcurrentTaskScheduler(Executors.newScheduledThreadPool(3))
	}
    beans {
		bean<PairMatcherTask>()
		bean<DateOrganizingTask>()
		bean<OverdueDateHandlerTask>()
	}
}

fun main(args: Array<String>) {
	app.run(args = args)
}
