package ua.betterdating.backend

import am.ik.yavi.builder.ValidatorBuilder
import am.ik.yavi.builder.constraint
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.env.Environment
import org.springframework.data.r2dbc.connectionfactory.R2dbcTransactionManager
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.bodyToMono
import org.springframework.web.reactive.function.server.json
import reactor.core.publisher.Mono
import reactor.core.publisher.Mono.error
import reactor.core.publisher.Mono.just
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

    fun emailStatus(request: ServerRequest) =
            withValidEmail(request, request.queryParam("email").orElse(null)) { email ->
                emailStatus(email)
                        .flatMap { ok().json().bodyValue(EmailStatus(used = it)) }
            }

    fun submitEmail(request: ServerRequest) =
            request.bodyToMono<SubmitEmailRequest>()
                    .flatMap { submitEmailRequest ->
                        withValidEmail(request, submitEmailRequest.email) { requestEmail ->
                            emailStatus(requestEmail).flatMap { used ->
                                if (used) error(EmailAlreadyPresentException()) else just(used)
                            }.flatMap {
                                val email = Email(email = requestEmail, verified = false)
                                val rxtx = TransactionalOperator.create(tm) // https://spring.io/blog/2019/05/16/reactive-transactions-with-spring
                                rxtx.execute {
                                    emailRepository.save(email).then(createAndSaveVerificationToken(email)).flatMap(sendMail(request, requestEmail))
                                }.then(ok().json().bodyValue(submitEmailRequest))
                            }
                        }
                    }

    fun verifyEmail(request: ServerRequest) = withValidVerifyEmailRequest(request) {
        parseToken(it.token!!).flatMap { decodedToken ->
            findTokenById(decodedToken.id).flatMap { token ->
                if (token.expires.isBefore(LocalDateTime.now())) {
                    error(ExpiredTokenException())
                } else {
                    emailRepository.findById(token.emailId)
                            .flatMap { email ->
                                email.verified = true
                                val rxtx = TransactionalOperator.create(tm)
                                rxtx.execute {
                                    emailRepository.update(email).then(emailVerificationTokenRepository.delete(token))
                                }.then(ok().json().bodyValue(token))
                            }
                }
            }
        }
    }

    fun triggerNewVerification(request: ServerRequest) = withValidVerifyEmailRequest(request) { previousRequest ->
        parseToken(previousRequest.token!!).flatMap { decodedToken ->
            emailRepository.findByEmail(decodedToken.email).flatMap { email ->
                val rxtx = TransactionalOperator.create(tm)
                rxtx.execute {
                    emailVerificationTokenRepository.delete(email).then(createAndSaveVerificationToken(email)).flatMap(sendMail(request, email.email))
                }.then(ok().json().bodyValue(previousRequest))
            }.switchIfEmpty(error(EmailNotFoundException()))
        }
    }

    private fun sendMail(request: ServerRequest, email: String): (EmailVerificationToken) -> Mono<Unit> {
        return {
            val hostHeader = hostHeader(request)
            sendVerificationEmailWithLink(hostHeader, it.id, email)
            Mono.empty<Unit>()
        }
    }

    fun mailTo(request: ServerRequest): Mono<ServerResponse> {
        val mail = environment.getProperty("spring.mail.username")!!
        val link = ContactLink(Base64.getUrlEncoder().encodeToString("mailto:$mail".toByteArray()))
        return ok().json().bodyValue(link)
    }

    private fun withValidEmail(
            request: ServerRequest, email: String?, processValidEmail: (String) -> Mono<ServerResponse>
    ) = emailValidator.validateToEither(EmailValue(email))
            .fold({ errors -> mapErrorToResponse(ValidationException(errors), request) }) { processValidEmail(it.email!!) }

    private fun withValidVerifyEmailRequest(
            request: ServerRequest, processValidRequest: (VerifyEmailRequest) -> Mono<ServerResponse>
    ) = request.bodyToMono<VerifyEmailRequest>()
            .flatMap {
                verifyEmailRequestValidator.validateToEither(it)
                        .fold({ errors -> mapErrorToResponse(ValidationException(errors), request) }) { validRequest -> processValidRequest(validRequest) }
            }

    private fun emailStatus(email: String) = emailRepository.findByEmail(email)
            .map { true }
            .switchIfEmpty(just(false))

    private fun createAndSaveVerificationToken(email: Email): Mono<EmailVerificationToken> {
        val token = EmailVerificationToken(emailId = email.id, expires = LocalDateTime.now().plusDays(1))
        return emailVerificationTokenRepository.save(token).thenReturn(token)
    }

    private fun hostHeader(request: ServerRequest) = request.headers().header("Host")[0]

    private fun findTokenById(id: UUID): Mono<EmailVerificationToken> {
        return emailVerificationTokenRepository.findById(id).switchIfEmpty(error(NoSuchTokenException()))
    }

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

fun parseToken(encodedToken: String): Mono<Token> {
    try {
        val decodedToken = String(Base64.getUrlDecoder().decode(encodedToken))
        val emailAndIdValues = decodedToken.split(":")
        return just(Token(id = UUID.fromString(emailAndIdValues[1]), email = emailAndIdValues[0]))
    } catch (e: Exception) {
        return error(InvalidTokenException())
    }
}
