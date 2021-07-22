package ua.betterdating.backend

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.core.env.Environment
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean
import org.springframework.web.reactive.function.server.ServerRequest
import ua.betterdating.backend.data.*
import ua.betterdating.backend.utils.*
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

    private suspend fun generateAndSendLinkWithToken(
        profileId: UUID, type: TokenType, templateName: String,
        to: String, subject: String,
        request: ServerRequest, urlPath: String, saveExtraTokenData: suspend (token: ExpiringToken) -> Any,
        templateParams: (link: String) -> Any
    ) = generateAndSendLinkWithToken(profileId, type, templateName, to, subject, unicodeHostHeader(request), urlPath, saveExtraTokenData, templateParams)

    private suspend fun generateAndSendLinkWithToken(
        profileId: UUID, type: TokenType, templateName: String,
        to: String, subject: String,
        unicodeHostHeader: String, urlPath: String, saveExtraTokenData: suspend (token: ExpiringToken) -> Any,
        templateParams: (link: String) -> Any
    ) {
        val token = withContext(Dispatchers.Default) { generateUrlSafeToken() }
        val expiringToken = ExpiringToken(
            profileId = profileId, expires = expiresValue(),
            encodedValue = passwordEncoder.encode(token), type = type
        )
        expiringTokenRepository.deleteByProfileIdAndTypeIfAny(profileId, type)
        expiringTokenRepository.save(expiringToken)
        saveExtraTokenData.invoke(expiringToken)

        val link = "https://$unicodeHostHeader/$urlPath?токен=${encodeToken(expiringToken.id, token)}"
        val body = renderTemplate(templateConfigurationFactory, templateName, templateParams.invoke(link))

        smotrinyMailSender.send(to = to, subject = subject, body = body)
    }

    suspend fun sendLink(templateName: String,
                         to: String, subject: String,
                         unicodeHostHeader: String, urlPath: String,
                         templateParams: (link: String) -> Any
    ) {
        val link = "https://$unicodeHostHeader/$urlPath"
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

    suspend fun sendChangeMailNotificationToOldAddress(oldEmailAddress: String) {
        val subject = "Эта почта больше не подключена к профилю на сайте \"смотрины.укр & смотрины.рус\""
        val body = renderTemplate(templateConfigurationFactory, "ChangeEmailNotificationToOldAddress.ftlh", object {
            val title = subject
            val contactUs = smotrinySender()
        })
        smotrinyMailSender.send(to = oldEmailAddress, subject = subject, body = body)
    }

    suspend fun sendTestMail(to: String) {
        val subject = "Тестовое письмо"
        smotrinyMailSender.send(to = to, subject = subject, body = subject)
    }

    suspend fun viewOtherUserProfile(targetUserId: UUID, targetUserEmail: String, subject: String,
                                     body: String, unicodeHost: String,
                                     saveExtraTokenData: suspend (token: ExpiringToken) -> Any
    ) {
        generateAndSendLinkWithToken(
            targetUserId, TokenType.VIEW_OTHER_USER_PROFILE, "LinkToViewOtherUserProfile.ftlh",
            targetUserEmail, subject, unicodeHost, "просмотр-профиля",
            // while saving additional token payload
            saveExtraTokenData
        ) { link ->
            object {
                val title = subject
                val body = body
                val actionLabel = "Просмотр профиля"
                val actionUrl = link
            }
        }
    }

    suspend fun dateOrganizedMessage(email: String, whenAndWhere: WhenAndWhere, body: String, lastHost: String) {
        val subject = "Организовано свидание ${formatDateTime(whenAndWhere.timeAndDate.withZoneSameInstant(whenAndWhere.timeZone)!!)}"
        sendLink(
            "TitleBodyAndLinkMessage.ftlh",
            email,
            subject,
            lastHost,
            "свидания"
        ) { link -> object {
            val title = subject
            val actionLabel = "Что дальше ?"
            val actionUrl = link
            val body = body
        }}
    }

    suspend fun sendSecondUserCheckedIn(to: String) {
        val subject = "Второй пользователь отметился о прибытии на свидание !"
        val body = renderTemplate(templateConfigurationFactory, "TitleBody.ftlh", object {
            val title = subject
            val body = ""
        })
        smotrinyMailSender.send(to = to, subject = subject, body = body)
    }

    suspend fun sendDateVerified(to: String, otherUserName: String) {
        val subject = "Свидание с $otherUserName было подтверждено!"
        val body = renderTemplate(templateConfigurationFactory, "TitleBody.ftlh", object {
            val title = subject
            val body = ""
        })
        smotrinyMailSender.send(to = to, subject = subject, body = body)
    }

    fun smotrinySender() = environment.getProperty("spring.mail.username")!!
}
