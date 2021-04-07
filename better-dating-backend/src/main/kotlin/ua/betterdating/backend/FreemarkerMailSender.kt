package ua.betterdating.backend

import org.springframework.core.env.Environment
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean
import org.springframework.web.reactive.function.server.ServerRequest
import ua.betterdating.backend.data.ExpiringTokenRepository
import ua.betterdating.backend.utils.renderTemplate
import ua.betterdating.backend.utils.unicodeHostHeader
import java.util.*

/**
 * Note: transactions should be handled on the calling side
 */
class FreemarkerMailSender(
        private val expiringTokenRepository: ExpiringTokenRepository,
        private val passwordEncoder: PasswordEncoder,
        private val smotrinyMailSender: SmotrinyMailSender,
        private val environment: Environment,
        private val templateConfigurationFactory: FreeMarkerConfigurationFactoryBean
) {
    suspend fun generateAndSendLinkWithToken(
            profileId: UUID, type: TokenType, templateName: String,
            to: String, subject: String,
            request: ServerRequest, urlPath: String,
            templateParams: (link: String) -> Any
    ) = generateAndSendLinkWithToken(profileId, type, templateName, to, subject, request, urlPath, {}, templateParams)

    suspend fun generateAndSendLinkWithToken(
            profileId: UUID, type: TokenType, templateName: String,
            to: String, subject: String,
            request: ServerRequest, urlPath: String, saveExtraTokenData: suspend (token: ExpiringToken) -> Any,
            templateParams: (link: String) -> Any
    ) {
        val token = generateUrlSafeToken()
        val expiringToken = ExpiringToken(
                profileId = profileId, expires = expiresValue(),
                encodedValue = passwordEncoder.encode(token), type = type
        )
        expiringTokenRepository.deleteByProfileIdAndTypeIfAny(profileId, type)
        expiringTokenRepository.save(expiringToken)
        saveExtraTokenData.invoke(expiringToken)

        val unicodeHostHeader = unicodeHostHeader(request)
        val link = "https://$unicodeHostHeader/$urlPath?токен=${encodeToken(expiringToken.id, token)}"
        val body = renderTemplate(templateConfigurationFactory, templateName, templateParams.invoke(link))

        smotrinyMailSender.send(to = to, subject = subject, body = body)
    }

    suspend fun generateAndSendEmailVerificationToken(
            profileId: UUID, templateName: String,
            to: String, subject: String,
            request: ServerRequest, templateParams: (link: String) -> Any
    ) {
        generateAndSendLinkWithToken(
                profileId, TokenType.EMAIL_VERIFICATION, templateName,
                to, subject, request, "подтвердить-почту", templateParams
        )
    }

    suspend fun sendWelcomeAndVerifyEmailMessage(profileId: UUID, to: String, request: ServerRequest) {
        generateAndSendEmailVerificationToken(
                profileId, "WelcomeAndVerifyEmail.ftlh",
                to, "Подтверждение почты", request
        ) { link ->
            object {
                val title = "Регистрация на сайте \"смотрины.укр/смотрины.рус\" успешна!"
                val actionLabel = "Подтвердить почту"
                val actionUrl = link
            }
        }
    }

    fun sendChangeMailNotificationToOldAddress(oldEmailAddress: String) {
        val subject = "Эта почта больше не подключена к профилю на сайте \"смотрины.укр & смотрины.рус\""
        val body = renderTemplate(templateConfigurationFactory, "ChangeEmailNotificationToOldAddress.ftlh", object {
            val title = subject
            val contactUs = smotrinySender()
        })
        smotrinyMailSender.send(to = oldEmailAddress, subject = subject, body = body)
    }

    fun sendTestMail(to: String) {
        val subject = "Тестовое письмо"
        smotrinyMailSender.send(to = to, subject = subject, body = subject)
    }

    fun smotrinySender() = environment.getProperty("spring.mail.username")!!
}
