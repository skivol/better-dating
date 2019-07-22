package ua.betterdating.backend

import org.glassfish.jersey.server.ResourceConfig
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean

@SpringBootApplication
class BackendApplication {
	@Bean
	fun jerseyConfig(): ResourceConfig {
		return ResourceConfig()
				.register(EmailController::class.java)
				.register(ExceptionMapper::class.java)
	}
}

fun main(args: Array<String>) {
	runApplication<BackendApplication>(*args)
}
