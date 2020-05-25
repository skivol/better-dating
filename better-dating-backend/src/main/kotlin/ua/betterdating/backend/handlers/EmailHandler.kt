package ua.betterdating.backend.handlers

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
import ua.betterdating.backend.*
import java.net.IDN
import java.time.LocalDateTime
import java.util.*

class EmailHandler(
        private val emailRepository: EmailRepository,
        private val emailVerificationTokenRepository: EmailVerificationTokenRepository,
        private val tm: R2dbcTransactionManager,
        private val smotrinyMailSender: SmotrinyMailSender,
        private val environment: Environment,
        private val templateConfigurationFactory: FreeMarkerConfigurationFactoryBean
) {
    private val LOG: Logger = LoggerFactory.getLogger(EmailHandler::class.java)

    suspend fun emailStatus(request: ServerRequest): ServerResponse {
        val validEmail = validEmail(request.queryParam("email").orElse(null))
        val used = emailStatus(validEmail)
        return ok().json().bodyValueAndAwait(EmailStatus(used = used))
    }

    suspend fun verifyEmail(request: ServerRequest): ServerResponse {
        val verifyEmailRequest = request.awaitBody<VerifyEmailRequest>()
        val decodedToken = parseToken(verifyEmailRequest.token)
        val token = emailVerificationTokenRepository.findById(decodedToken.id)
                ?: return mapErrorToResponse(NoSuchTokenException(), request)
        if (token.expires.isBefore(LocalDateTime.now())) {
            return mapErrorToResponse(ExpiredTokenException(), request)
        }
        val email = emailRepository.findById(token.emailId)
        email.verified = true
        TransactionalOperator.create(tm).executeAndAwait {
            emailRepository.update(email)
            emailVerificationTokenRepository.delete(token)
        }
        return ok().json().bodyValueAndAwait(token)
    }

    suspend fun triggerNewVerification(request: ServerRequest): ServerResponse {
        val previousRequest = request.awaitBody<VerifyEmailRequest>()
        val decodedToken = parseToken(previousRequest.token)
        val token = emailVerificationTokenRepository.findById(decodedToken.id)
                ?: return mapErrorToResponse(NoSuchTokenException(), request)
        val email = emailRepository.findById(token.emailId)

        TransactionalOperator.create(tm).executeAndAwait {
            emailVerificationTokenRepository.deleteByProfileIdIfAny(email)
            val emailVerificationToken = removeExistingAndCreateAndSaveNewVerificationToken(email)
            sendVerificationEmailWithLink(request, email.email, emailVerificationToken)
        }
        return ok().json().bodyValueAndAwait(previousRequest)
    }

    @Suppress("UNUSED_PARAMETER")
    suspend fun mailTo(request: ServerRequest): ServerResponse {
        val mail = smotrinySender()
        val link = Base64.getUrlEncoder().encodeToString("mailto:$mail".toByteArray())
        return ok().json().bodyValueAndAwait(object { val link = link })
    }

    private fun smotrinySender() = environment.getProperty("spring.mail.username")!!

    private suspend fun emailStatus(email: String) = emailRepository.findByEmail(email)
            ?.let { true }
            ?: false

    suspend fun removeExistingAndCreateAndSaveNewVerificationToken(email: Email): EmailVerificationToken {
        emailVerificationTokenRepository.deleteByProfileIdIfAny(email)
        val token = EmailVerificationToken(emailId = email.id, expires = LocalDateTime.now().plusDays(1))
        emailVerificationTokenRepository.save(token)
        return token
    }

    private fun hostHeader(request: ServerRequest) = request.headers().header("Host")[0]

    fun sendVerificationEmailWithLink(
        request: ServerRequest, receiverEmail: String, emailVerificationToken: EmailVerificationToken,
        subject: String = "Подтверждение почты", templateName: String = "WelcomeAndVerifyEmail.ftlh"
    ) {
        val hostHeader = hostHeader(request)

        val unicodeHostHeader = IDN.toUnicode(hostHeader)
        val publicToken = Token(emailVerificationToken.id).base64Value()
        val link = "https://$unicodeHostHeader/подтвердить-почту?токен=$publicToken"
        val template = templateConfigurationFactory.createConfiguration().getTemplate(templateName);
        val body = FreeMarkerTemplateUtils.processTemplateIntoString(template, object { val verifyLink = link })

        smotrinyMailSender.send(to = receiverEmail, subject = subject, body = body)
    }

    fun sendChangeMailNotificationToOldAddress(oldEmailAddress: String) {
        val subject = "Эта почта больше не подключена к профилю на сайте смотрины.укр и смотрины.рус"
        val template = templateConfigurationFactory.createConfiguration().getTemplate("ChangeEmailNotificationToOldAddress.ftlh");
        val body = FreeMarkerTemplateUtils.processTemplateIntoString(template, object { val contactUs = smotrinySender() })
        smotrinyMailSender.send(to = oldEmailAddress, subject = subject, body = body)
    }
}
