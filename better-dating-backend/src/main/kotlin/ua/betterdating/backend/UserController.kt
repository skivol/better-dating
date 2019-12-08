package ua.betterdating.backend

import am.ik.yavi.builder.ValidatorBuilder
import am.ik.yavi.builder.constraint
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.env.Environment
import org.springframework.data.r2dbc.connectionfactory.R2dbcTransactionManager
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import java.net.IDN
import java.time.LocalDateTime
import java.util.*


@Suppress("UNUSED_PARAMETER")
class EmailHandler(
        private val emailRepository: EmailRepository,
        private val emailVerificationTokenRepository: EmailVerificationTokenRepository,
        private val tm: R2dbcTransactionManager,
        private val smotrinyMailSender: SmotrinyMailSender,
        private val environment: Environment,
        private val templateConfigurationFactory: FreeMarkerConfigurationFactoryBean
) {
    private val LOG: Logger = LoggerFactory.getLogger(EmailHandler::class.java)

    private val emailValidator = ValidatorBuilder.of<EmailValue>()
            .constraint(EmailValue::email) {
                notNull()
                        .greaterThanOrEqual(5)
                        .lessThanOrEqual(50)
                        .email()
            }.build()
    private val verifyEmailRequestValidator = ValidatorBuilder.of<VerifyEmailRequest>()
            .constraint(VerifyEmailRequest::token) { notNull() }.build()

    suspend fun emailStatus(request: ServerRequest) = withValidEmail(request, request.queryParam("email").orElse(null)) { email ->
        val used = emailStatus(email)
        ok().json().bodyValueAndAwait(EmailStatus(used = used))
    }

    suspend fun submitEmail(request: ServerRequest): ServerResponse {
        val submitEmailRequest = request.awaitBody<SubmitEmailRequest>()
        return withValidEmail(request, submitEmailRequest.email) { requestEmail ->
            val used = emailStatus(requestEmail)
            if (used) {
                return@withValidEmail mapErrorToResponse(EmailAlreadyPresentException(), request)
            }
            val email = Email(email = requestEmail, verified = false)
            TransactionalOperator.create(tm).executeAndAwait { // https://spring.io/blog/2019/05/16/reactive-transactions-with-spring
                emailRepository.save(email)
                val emailVerificationToken = createAndSaveVerificationToken(email)
                sendMail(request, requestEmail, emailVerificationToken)
            }
            ok().json().bodyValueAndAwait(submitEmailRequest)
        }
    }

    suspend fun verifyEmail(request: ServerRequest) = withValidVerifyEmailRequest(request) {
        val decodedToken = parseToken(it.token!!)
                ?: return@withValidVerifyEmailRequest mapErrorToResponse(InvalidTokenException(), request)
        val token = emailVerificationTokenRepository.findById(decodedToken.id)
                ?: return@withValidVerifyEmailRequest mapErrorToResponse(NoSuchTokenException(), request)
        if (token.expires.isBefore(LocalDateTime.now())) {
            return@withValidVerifyEmailRequest mapErrorToResponse(ExpiredTokenException(), request)
        }
        val email = emailRepository.findById(token.emailId)
        email.verified = true
        TransactionalOperator.create(tm).executeAndAwait {
            emailRepository.update(email)
            emailVerificationTokenRepository.delete(token)
        }
        ok().json().bodyValueAndAwait(token)
    }

    suspend fun triggerNewVerification(request: ServerRequest) = withValidVerifyEmailRequest(request) { previousRequest ->
        val decodedToken = parseToken(previousRequest.token!!)
                ?: return@withValidVerifyEmailRequest mapErrorToResponse(InvalidTokenException(), request)
        val email = emailRepository.findByEmail(decodedToken.email)
                ?: return@withValidVerifyEmailRequest mapErrorToResponse(EmailNotFoundException(), request)
        TransactionalOperator.create(tm).executeAndAwait {
            emailVerificationTokenRepository.delete(email)
            val emailVerificationToken = createAndSaveVerificationToken(email)
            sendMail(request, email.email, emailVerificationToken)
        }
        ok().json().bodyValueAndAwait(previousRequest)
    }

    private fun sendMail(request: ServerRequest, email: String, emailVerificationToken: EmailVerificationToken) {
        val hostHeader = hostHeader(request)
        sendVerificationEmailWithLink(hostHeader, emailVerificationToken.id, email)
    }

    suspend fun mailTo(request: ServerRequest): ServerResponse {
        val mail = environment.getProperty("spring.mail.username")!!
        val link = ContactLink(Base64.getUrlEncoder().encodeToString("mailto:$mail".toByteArray()))
        return ok().json().bodyValueAndAwait(link)
    }

    private suspend fun withValidEmail(
        request: ServerRequest, email: String?, processValidEmail: suspend (String) -> ServerResponse
    ): ServerResponse {
        val validateResult = emailValidator.validate(EmailValue(email))
        return if (validateResult.isValid) {
            processValidEmail(email!!)
        } else {
            mapErrorToResponse(ValidationException(validateResult), request)
        }
    }

    private suspend fun withValidVerifyEmailRequest(
        request: ServerRequest, processValidRequest: suspend (VerifyEmailRequest) -> ServerResponse
    ): ServerResponse {
        val verifyEmailRequest = request.awaitBody<VerifyEmailRequest>()
        val validateResult = verifyEmailRequestValidator.validate(verifyEmailRequest)
        return if (validateResult.isValid) {
            processValidRequest(verifyEmailRequest)
        } else {
            mapErrorToResponse(ValidationException(validateResult), request)
        }
    }

    private suspend fun emailStatus(email: String) = emailRepository.findByEmail(email)
            ?.let { true }
            ?: false

    private suspend fun createAndSaveVerificationToken(email: Email): EmailVerificationToken {
        val token = EmailVerificationToken(emailId = email.id, expires = LocalDateTime.now().plusDays(1))
        emailVerificationTokenRepository.save(token)
        return token
    }

    private fun hostHeader(request: ServerRequest) = request.headers().header("Host")[0]

    private fun sendVerificationEmailWithLink(hostHeader: String, id: UUID, email: String) {
        val unicodeHostHeader = IDN.toUnicode(hostHeader)
        val from = environment.getProperty("spring.mail.username")!!
        val publicToken = Token(id = id, email = email).base64Value()
        val link = "https://$unicodeHostHeader/подтвердить-почту?токен=$publicToken"
        val subject = "Подтверждение почты"
        val template = templateConfigurationFactory.createConfiguration().getTemplate("ValidateEmail.ftlh");
        val body = FreeMarkerTemplateUtils.processTemplateIntoString(template, VerifyLink(link))
        smotrinyMailSender.send(from = from, to = email, subject = subject, body = body)
    }
}

data class EmailValue(val email: String?)
data class EmailStatus(val used: Boolean)
data class SubmitEmailRequest(val email: String?)
data class VerifyEmailRequest(val token: String?)
data class ContactLink(val link: String)
data class VerifyLink(val verifyLink: String)

// https://docs.oracle.com/javase/8/docs/api/java/util/Base64.html
class Token(val id: UUID, val email: String) {
    fun base64Value(): String {
        return Base64.getUrlEncoder().encodeToString("$email:$id".toByteArray())
    }
}

fun parseToken(encodedToken: String): Token? {
    try {
        val decodedToken = String(Base64.getUrlDecoder().decode(encodedToken))
        val emailAndIdValues = decodedToken.split(":")
        return Token(id = UUID.fromString(emailAndIdValues[1]), email = emailAndIdValues[0])
    } catch (e: Exception) {
        return null
    }
}
