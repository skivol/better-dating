package ua.betterdating.backend.handlers

import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
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
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.awaitBody
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import ua.betterdating.backend.*
import ua.betterdating.backend.TokenType.ONE_TIME_PASSWORD
import ua.betterdating.backend.data.DatingProfileInfoRepository
import ua.betterdating.backend.data.EmailRepository
import ua.betterdating.backend.data.ExpiringTokenRepository
import ua.betterdating.backend.data.UserRoleRepository
import ua.betterdating.backend.utils.okEmptyJsonObject
import java.util.*

class AuthHandler(
    private val emailRepository: EmailRepository,
    private val freemarkerMailSender: FreemarkerMailSender,
    private val expiringTokenRepository: ExpiringTokenRepository,
    private val roleRepository: UserRoleRepository,
    private val datingProfileInfoRepository: DatingProfileInfoRepository,
    private val passwordEncoder: PasswordEncoder,
    private val transactionalOperator: TransactionalOperator,
    private val serverSecurityContextRepository: ServerSecurityContextRepository
) {
    @Suppress("UNUSED_PARAMETER")
    suspend fun csrf(request: ServerRequest) = okEmptyJsonObject()

    suspend fun sendLoginLink(request: ServerRequest): ServerResponse {
        val validEmail = request.awaitBody<EmailValue>()
        val profile = emailRepository.findByEmail(validEmail.email)
        if (profile == null || !profile.verified) {
            randomDelay(500, 4_000) // let's not reveal that email doesn't exist in the system so easily
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
                    val message = "Внимание! Ссылка будет действенна только в течение суток."
                }
            }
        }
        return okEmptyJsonObject()
    }

    suspend fun login(request: ServerRequest): ServerResponse {
        val decodedToken = request.awaitBody<Token>().decode()
        expiringTokenRepository.findById(decodedToken.id)?.also { dbPassword ->
            dbPassword.verify(decodedToken, ONE_TIME_PASSWORD, passwordEncoder)
        } ?: throwBadCredentials()
        val profile = expiringTokenRepository.findEmailByTokenId(decodedToken.id)?.also { profile ->
            if (!profile.verified) throw DisabledException("1001")
        } ?: throwBadCredentials()

        transactionalOperator.executeAndAwait {
            authenticate(profile.id, request)
            expiringTokenRepository.deleteByProfileIdAndTypeIfAny(profile.id, ONE_TIME_PASSWORD)
        }

        return okEmptyJsonObject()
    }

    suspend fun currentUser(request: ServerRequest): ServerResponse {
        val principal = request.principal().awaitFirst() as UsernamePasswordAuthenticationToken
        val secondStageEnabled = datingProfileInfoRepository.find(UUID.fromString(principal.name)) != null // optimize later if needed
        return ok().bodyValueAndAwait(User(principal.name, principal.authorities.map { it.authority }, secondStageEnabled))
    }

    /**
     * see also AuthenticationWebFilter::onAuthenticationSuccess
     */
    suspend fun authenticate(profileId: UUID, request: ServerRequest) {
        val auth = createAuth(profileId.toString(), roleRepository.findAll(profileId))
        SecurityContextHolder.getContext().authentication = auth
        serverSecurityContextRepository.save(request.exchange(), SecurityContextHolder.getContext()).awaitFirstOrNull()
    }
}

fun createAuth(profileId: String, roles: List<UserRole>): UsernamePasswordAuthenticationToken {
    val userDetails = User(profileId, "", roles.map { SimpleGrantedAuthority(it.role.toString()) })
    return UsernamePasswordAuthenticationToken(userDetails, null, userDetails.authorities)
}

class User(val id: String, val roles: List<String>, val secondStageEnabled: Boolean)
