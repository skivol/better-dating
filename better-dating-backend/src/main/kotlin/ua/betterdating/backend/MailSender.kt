package ua.betterdating.backend

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import org.springframework.core.env.Environment
import org.springframework.mail.MailException
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import ua.betterdating.backend.utils.LoggerDelegate
import java.lang.RuntimeException

interface SmotrinyMailSender {
	suspend fun send(to: String, subject: String, body: String);
}

// https://github.com/spring-projects/spring-boot/blob/v2.1.6.RELEASE/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/mail/MailProperties.java
// https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-email.html
// https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/integration.html#mail
class SmotrinyMailSenderImpl(
		private val environment: Environment,
		private val mailSender: JavaMailSender
): SmotrinyMailSender {
	override suspend fun send(to: String, subject: String, body: String) {
		val from = environment.getProperty("spring.mail.username")!!
		val mimeMessage = mailSender.createMimeMessage()
		val helper = MimeMessageHelper(mimeMessage, "utf-8");
		helper.setText(body, true); // true -> html
		helper.setFrom(from)
		helper.setSubject(subject)
		helper.setTo(to)
		withContext(Dispatchers.IO) {
			try {
				mailSender.send(mimeMessage)
			} catch (ex: MailException) {
				throw ex
			}
		}
	}
}

object ConsoleMailSender: SmotrinyMailSender {
	private val log by LoggerDelegate()

	override suspend fun send(to: String, subject: String, body: String) {
		delay(5_000)
        //  throw RuntimeException("Could not send anything. Sorry.")
		log.info("Sending email to: $to")
		log.info("Subject: $subject")
		log.info(body)
	}
}
