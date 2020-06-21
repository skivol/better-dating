package ua.betterdating.backend.handlers

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import ua.betterdating.backend.*
import ua.betterdating.backend.TokenType.EMAIL_VERIFICATION
import java.util.*

class EmailHandler(
        private val emailRepository: EmailRepository,
        private val expiringTokenRepository: ExpiringTokenRepository,
        private val passwordEncoder: PasswordEncoder,
        private val freemarkerMailSender: FreemarkerMailSender,
        private val transactionalOperator: TransactionalOperator,
        private val authHandler: AuthHandler
) {
    private val LOG: Logger = LoggerFactory.getLogger(EmailHandler::class.java)

    suspend fun verifyEmail(request: ServerRequest): ServerResponse {
        val decodedToken = request.awaitBody<Token>().decode()
        val token = expiringTokenRepository.findByProfileIdAndType(decodedToken.profileId, EMAIL_VERIFICATION)
                ?: throw NoSuchTokenException()
        if (token.expired()) {
            throw ExpiredTokenException()
        }
        if (!passwordEncoder.matches(decodedToken.tokenValue, token.encodedValue)) {
            throw NoSuchTokenException()
        }
        val email = emailRepository.findById(token.profileId)!!
        email.verified = true
        transactionalOperator.executeAndAwait {
            emailRepository.update(email)
            expiringTokenRepository.delete(token)
            if (request.awaitPrincipal() == null) { // authenticate only if not already authenticated
                authHandler.authenticate(decodedToken, request)
            }
        }
        return okEmptyJsonObject()
    }

    suspend fun triggerNewVerification(request: ServerRequest): ServerResponse {
        val decodedToken = request.awaitBody<Token>().decode()
        val token = expiringTokenRepository.findByProfileIdAndType(decodedToken.profileId, EMAIL_VERIFICATION)
                ?: return mapErrorToResponse(NoSuchTokenException(), request)
        val email = emailRepository.findById(token.profileId)!!

        transactionalOperator.executeAndAwait {
            freemarkerMailSender.sendWelcomeAndVerifyEmailMessage(email.id, email.email, request)
        }
        return okEmptyJsonObject()
    }

    @Suppress("UNUSED_PARAMETER")
    suspend fun mailTo(request: ServerRequest): ServerResponse {
        val mail = freemarkerMailSender.smotrinySender()
        val link = Base64.getUrlEncoder().encodeToString("mailto:$mail".toByteArray())
        return ok().json().bodyValueAndAwait(object {
            val link = link
        })
    }
}
