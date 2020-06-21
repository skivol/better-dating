package ua.betterdating.backend.handlers

import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.DisabledException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.server.context.ServerSecurityContextRepository
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.awaitBody
import ua.betterdating.backend.*
import ua.betterdating.backend.TokenType.ONE_TIME_PASSWORD

class AuthHandler(
        private val emailRepository: EmailRepository,
        private val freemarkerMailSender: FreemarkerMailSender,
        private val expiringTokenRepository: ExpiringTokenRepository,
        private val passwordEncoder: PasswordEncoder,
        private val transactionalOperator: TransactionalOperator,
        private val serverSecurityContextRepository: ServerSecurityContextRepository
) {
    suspend fun csrf(request: ServerRequest) = okEmptyJsonObject()

    suspend fun sendLoginLink(request: ServerRequest): ServerResponse {
        val validEmail = request.awaitBody<EmailValue>()
        val profile = emailRepository.findByEmail(validEmail.email)
        if (profile == null || !profile.verified) {
            randomDelay() // let's not reveal that email doesn't exist in the system so easily
            return okEmptyJsonObject()
        }

        val subject = "Ссылка для входа на сайт Смотрины.укр & Смотрины.рус"
        transactionalOperator.executeAndAwait {
            freemarkerMailSender.generateAndSendLinkWithToken(
                    profile.id, ONE_TIME_PASSWORD, "LoginLink.ftlh",
                    profile.email, subject, request, "вход"
            ) { link ->
                object {
                    val title = subject
                    val actionLabel = "Войти"
                    val actionUrl = link
                }
            }
        }
        return okEmptyJsonObject()
    }

    suspend fun login(request: ServerRequest): ServerResponse { // consider filter or hacking into form login
        val decodedToken = request.awaitBody<Token>().decode()
        val dbPassword = expiringTokenRepository.findByProfileIdAndType(decodedToken.profileId, ONE_TIME_PASSWORD)
                ?: throwBadCredentials()
        val profile = emailRepository.findById(decodedToken.profileId) ?: throwBadCredentials()

        if (dbPassword.expired()) {
            throw ExpiredTokenException()
        }
        if (!passwordEncoder.matches(decodedToken.tokenValue, dbPassword.encodedValue)) {
            throwBadCredentials()
        }
        if (!profile.verified) {
            throw DisabledException("1001")
        }

        transactionalOperator.executeAndAwait {
            authenticate(decodedToken, request)
            expiringTokenRepository.deleteByProfileIdAndTypeIfAny(decodedToken.profileId, ONE_TIME_PASSWORD)
        }

        return okEmptyJsonObject()
    }

    suspend fun authenticate(decodedToken: DecodedToken, request: ServerRequest) {
        val userDetails = User(decodedToken.profileId.toString(), decodedToken.tokenValue, listOf(SimpleGrantedAuthority("ROLE_USER")))
        val auth = UsernamePasswordAuthenticationToken(userDetails, null, userDetails.authorities)
        SecurityContextHolder.getContext().authentication = auth
        serverSecurityContextRepository.save(request.exchange(), SecurityContextHolder.getContext()).awaitFirstOrNull()
    }

    private fun throwBadCredentials(): Nothing {
        throw BadCredentialsException("1000")
    }
}
