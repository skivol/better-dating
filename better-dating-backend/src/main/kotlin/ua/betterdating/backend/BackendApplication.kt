package ua.betterdating.backend

import org.glassfish.jersey.server.ResourceConfig
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
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
		return freeMarkerConfigurer;
	}
}

fun main(args: Array<String>) {
	runApplication<BackendApplication>(*args)
}
