package ua.betterdating.backend.handlers

import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.security.core.Authentication
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.server.WebFilterExchange
import org.springframework.security.web.server.authentication.logout.DelegatingServerLogoutHandler
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.awaitBody
import org.springframework.web.reactive.function.server.awaitPrincipal
import reactor.core.publisher.Mono
import ua.betterdating.backend.*
import ua.betterdating.backend.data.*
import ua.betterdating.backend.utils.okEmptyJsonObject
import java.util.*

class ProfileRemovalHandler(
    private val emailRepository: EmailRepository,
    private val acceptedTermsRepository: AcceptedTermsRepository,
    private val profileInfoRepository: ProfileInfoRepository,
    private val heightRepository: HeightRepository,
    private val weightRepository: WeightRepository,
    private val activityRepository: ActivityRepository,
    private val profileEvaluationRepository: ProfileEvaluationRepository,
    private val expiringTokenRepository: ExpiringTokenRepository,
    private val userRoleRepository: UserRoleRepository,
    private val historyRepository: HistoryRepository,
    private val datingProfileInfoRepository: DatingProfileInfoRepository,
    private val userPopulatedLocalityRepository: UserPopulatedLocalityRepository,
    private val userLanguageRepository: UserLanguageRepository,
    private val userInterestRepository: UserInterestRepository,
    private val userPersonalQualityRepository: UserPersonalQualityRepository,
    private val pairsRepository: PairsRepository,
    private val loginInformationRepository: LoginInformationRepository,
    private val pairLockRepository: PairLockRepository,
    private val datesRepository: DatesRepository,
    private val checkInRepository: CheckInRepository,
    private val decisionRepository: PairDecisionRepository,
    private val profileImprovementRepository: ProfileImprovementRepository,
    private val profileCredibilityRepository: ProfileCredibilityRepository,
    private val logoutHandler: DelegatingServerLogoutHandler,
    private val passwordEncoder: PasswordEncoder,
    private val transactionalOperator: TransactionalOperator,
    private val freemarkerMailSender: FreemarkerMailSender
    ) {
    suspend fun requestRemoval(request: ServerRequest): ServerResponse {
        val profile = currentUserEmail(emailRepository, request)
        val subject = "Запрос на удаление профиля на сайте смотрины.укр & смотрины.рус"
        transactionalOperator.executeAndAwait {
            freemarkerMailSender.generateAndSendLinkWithToken(
                profile.id, TokenType.ACCOUNT_REMOVAL, "LinkToRemoveAccount.ftlh",
                profile.email, subject, request, "удаление-профиля"
            ) { link ->
                object {
                    val title = subject
                    val actionLabel = "Удаление профиля"
                    val actionUrl = link
                    val message = "Обратите внимание! Это действие нельзя будет отменить!"
                }
            }
        }
        return okEmptyJsonObject()
    }

    suspend fun removeProfile(request: ServerRequest): ServerResponse {
        val deleteProfileData = request.awaitBody<DeleteProfileData>()
        val principal = request.awaitPrincipal()

        // verify token
        val currentUserProfileId = UUID.fromString(principal!!.name)
        val webToken = Token(deleteProfileData.token).decode()
        val dbToken = (expiringTokenRepository.findById(webToken.id) ?: throwNoSuchToken()).also {
            if (it.profileId != currentUserProfileId) throwNoSuchToken() // only own profile removal is allowed
        }
        dbToken.verify(webToken.tokenValue, TokenType.ACCOUNT_REMOVAL, passwordEncoder)

        transactionalOperator.executeAndAwait {
            // remove profile data
            profileEvaluationRepository.delete(currentUserProfileId)
            activityRepository.delete(currentUserProfileId)
            weightRepository.delete(currentUserProfileId)
            heightRepository.delete(currentUserProfileId)
            profileInfoRepository.delete(currentUserProfileId)
            acceptedTermsRepository.delete(currentUserProfileId)

            expiringTokenRepository.deleteByProfileId(currentUserProfileId)
            userRoleRepository.delete(currentUserProfileId)
            loginInformationRepository.delete(currentUserProfileId)

            // remove second stage profile data
            datingProfileInfoRepository.delete(currentUserProfileId)
            userPopulatedLocalityRepository.delete(currentUserProfileId)
            userLanguageRepository.delete(currentUserProfileId)
            userInterestRepository.delete(currentUserProfileId)
            userPersonalQualityRepository.delete(currentUserProfileId, Attitude.Likes)
            userPersonalQualityRepository.delete(currentUserProfileId, Attitude.Dislikes)

            checkInRepository.delete(currentUserProfileId)
            decisionRepository.delete(currentUserProfileId)
            profileImprovementRepository.delete(currentUserProfileId)
            profileCredibilityRepository.delete(currentUserProfileId)

            pairLockRepository.delete(DatingPairLock(currentUserProfileId))
            pairsRepository.unlockOtherUser(currentUserProfileId)

            datesRepository.deleteWhereSecondUserIsAlreadyRemoved(currentUserProfileId)
            pairsRepository.deleteWhereSecondUserIsAlreadyRemoved(currentUserProfileId)
            pairsRepository.deactivateWhereParticipates(currentUserProfileId)

            emailRepository.delete(currentUserProfileId)
            historyRepository.deleteRelatedProfileViewsWhereBothUsersAreDeleted(currentUserProfileId)
            historyRepository.deleteEmailChangedEvents(currentUserProfileId)

            // + save feedback
            historyRepository.trackProfileRemovalFeedback(currentUserProfileId, deleteProfileData.reason, deleteProfileData.explanationComment)
        }
        // perform logout
        logoutHandler.logout(WebFilterExchange(request.exchange()) { Mono.empty() }, principal as Authentication).awaitFirstOrNull()

        return okEmptyJsonObject()
    }
}