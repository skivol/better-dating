package ua.betterdating.backend

import java.io.File
import org.glassfish.jersey.server.ResourceConfig
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties
import org.springframework.boot.autoconfigure.mail.MailProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.core.env.Environment

import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer

@SpringBootApplication
class BackendApplication {
	@Bean
	fun jerseyConfig(): ResourceConfig {
		return ResourceConfig()
				.register(EmailController::class.java)
				.register(ExceptionMapper::class.java)
	}

	@Bean
	fun freemarkerConfig(): FreeMarkerConfigurer {
		val freeMarkerConfigurer = FreeMarkerConfigurer();
		freeMarkerConfigurer.setTemplateLoaderPath("classpath:/templates");
		freeMarkerConfigurer.setDefaultEncoding("UTF-8");
		return freeMarkerConfigurer
	}

	@Bean
	@Primary
	@ConfigurationProperties(prefix = "spring.datasource")
	fun extendedDataSourceProperties(env: Environment): DataSourceProperties {
		val dataSourceProperties = DataSourceProperties()
		env.getProperty("spring.datasource.passwordfile")
			?.let { dataSourceProperties.password = File(it).readText().trim() }
		return dataSourceProperties
	}

	@Bean
	@Primary
	@ConfigurationProperties(prefix = "spring.mail")
	fun extendedMailProperties(env: Environment): MailProperties {
		val mailProperties = MailProperties()
		env.getProperty("spring.mail.passwordfile")
			?.let { mailProperties.password = File(it).readText().trim() }
		return mailProperties
	}
}

fun main(args: Array<String>) {
	runApplication<BackendApplication>(*args)
}
