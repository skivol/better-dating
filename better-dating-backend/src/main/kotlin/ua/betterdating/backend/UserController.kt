package ua.betterdating.backend

import freemarker.template.Configuration
import java.lang.IllegalArgumentException
import java.net.IDN
import java.time.LocalDateTime
import java.util.UUID
import java.util.Base64
import javax.validation.Valid
import javax.validation.constraints.Email as ValidEmail
import javax.validation.constraints.NotNull
import javax.ws.rs.*
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.Response
import javax.ws.rs.core.Response.Status
import javax.ws.rs.HeaderParam
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
// https://github.com/spring-projects/spring-data-commons/pull/299/files
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.core.env.Environment


@Component
@Path("/user/email")
class EmailController @Autowired constructor(
	val emailRepository: EmailRepository,
	val emailVerificationTokenRepository: EmailVerificationTokenRepository,
	val smotrinyMailSender: SmotrinyMailSender,
	val environment: Environment,
	val templateConfiguration: Configuration
) {
	private val LOG: Logger = LoggerFactory.getLogger(EmailController::class.java)

	@GET
	@Path("/status")
	@Produces(MediaType.APPLICATION_JSON)
	fun emailStatus(@Valid @NotNull @ValidEmail @QueryParam("email") email: String): EmailStatus {
		return EmailStatus(used = (emailRepository.findByEmail(email) != null))
	}

	@POST
	@Path("/submit")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	fun submitEmail(@HeaderParam("Host") hostHeader: String, @Valid @RequestBody submitEmailRequest: SubmitEmailRequest): SubmitEmailRequest {
		if (emailStatus(submitEmailRequest.email).used) {
			throw EmailAlreadyPresentException()
		}
		LOG.info("Processing submit email request. Host: $hostHeader")

		val email = Email(email = submitEmailRequest.email, verified = false)
		emailRepository.save(email)

		val verificationTokenEntity = createAndSaveVerificationToken(email)

		sendVerificationEmailWithLink(hostHeader, verificationTokenEntity.id!!, submitEmailRequest.email)

		return submitEmailRequest
	}

	@POST
	@Path("/verify")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	fun verifyEmail(@Valid request: VerifyEmailRequest): VerifyEmailRequest {
		val decodedToken = parseToken(request.token)

		val token = findTokenById(decodedToken.id)

		if (token.expires.isBefore(LocalDateTime.now())) {
			throw ExpiredTokenException()
		}

		val email = token.email
		email.verified = true
		emailRepository.save(email)
		emailVerificationTokenRepository.delete(token)

		return request
	}

	@POST
	@Path("/new-verification")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	fun triggerNewVerification(@HeaderParam("Host") hostHeader: String, @Valid previousRequest: VerifyEmailRequest): VerifyEmailRequest {
		val decodedToken = parseToken(previousRequest.token)
		val email = emailRepository.findByEmail(decodedToken.email) ?: throw EmailNotFoundException()
		// Remove existing token if any
		emailVerificationTokenRepository.findByEmail(email)?.let {
			emailVerificationTokenRepository.delete(it)
		}

		val newToken = createAndSaveVerificationToken(email)
		sendVerificationEmailWithLink(hostHeader, newToken.id!!, email.email)

		return previousRequest
	}

	@GET
	@Path("/contact")
	@Produces(MediaType.APPLICATION_JSON)
	fun redirectToMailTo(): ContactLink {
		val mail = environment.getProperty("spring.mail.username")!!
		return ContactLink(Base64.getUrlEncoder().encodeToString("mailto:$mail".toByteArray()))
	}

	fun createAndSaveVerificationToken(email: Email): EmailVerificationToken {
		val token = EmailVerificationToken(email = email, expires = LocalDateTime.now().plusDays(1))
		emailVerificationTokenRepository.save(token)
		return token
	}

	fun findTokenById(id: UUID): EmailVerificationToken {
		return emailVerificationTokenRepository.findByIdOrNull(id)
				?: throw NoSuchTokenException()
	}

	fun sendVerificationEmailWithLink(hostHeader: String, id: UUID, email: String) {
		val unicodeHostHeader = IDN.toUnicode(hostHeader)
		val from = environment.getProperty("spring.mail.username")!!
		val publicToken = Token(id = id, email = email).base64Value()
		val link = "https://$unicodeHostHeader/подтвердить-почту?токен=$publicToken"
		val subject = "Подтверждение почты"
		val template = templateConfiguration.getTemplate("ValidateEmail.ftlh");
		val body = FreeMarkerTemplateUtils.processTemplateIntoString(template, VerifyLink(link))
		smotrinyMailSender.send(from = from, to = email, subject = subject, body = body)
	}
}

data class EmailStatus(val used: Boolean)
data class SubmitEmailRequest(@NotNull @ValidEmail val email: String)
data class VerifyEmailRequest(@NotNull val token: String)
data class ContactLink(val link: String)
data class VerifyLink(val verifyLink: String)

// https://docs.oracle.com/javase/8/docs/api/java/util/Base64.html
class Token(val id: UUID, val email: String) {
	fun base64Value(): String {
		return Base64.getUrlEncoder().encodeToString("$email:$id".toByteArray())
	}
}

fun parseToken(encodedToken: String): Token {
	try {
		val decodedToken = String(Base64.getUrlDecoder().decode(encodedToken))
		val emailAndIdValues = decodedToken.split(":")
		return Token(id = UUID.fromString(emailAndIdValues[1]), email = emailAndIdValues[0])
	} catch (e: Exception) {
		throw InvalidTokenException()
	}
}
