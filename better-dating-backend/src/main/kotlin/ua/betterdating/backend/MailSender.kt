package ua.betterdating.backend

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.MailException
import org.springframework.mail.MailSender
import org.springframework.mail.SimpleMailMessage
import org.springframework.stereotype.Component

// https://github.com/spring-projects/spring-boot/blob/v2.1.6.RELEASE/spring-boot-project/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/mail/MailProperties.java
// https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-email.html
// https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/integration.html#mail
@Component
class SmotrinyMailSender @Autowired constructor(val mailSender: MailSender) {
	fun send(to: String, subject: String, body: String) {
		val msg = SimpleMailMessage()
		msg.setFrom("smotriny@i.ua")
		msg.setSubject(subject)
		msg.setTo(to)
		msg.setText(body)
		try{
			mailSender.send(msg)
		}
		catch (ex: MailException) {
			// simply log it and go on...
			ex.printStackTrace()
		}
	}
}

