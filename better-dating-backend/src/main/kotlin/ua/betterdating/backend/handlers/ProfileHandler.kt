package ua.betterdating.backend.handlers

import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.security.core.Authentication
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.server.WebFilterExchange
import org.springframework.security.web.server.authentication.logout.DelegatingServerLogoutHandler
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import reactor.core.publisher.Mono
import ua.betterdating.backend.*
import ua.betterdating.backend.ActivityType.*
import ua.betterdating.backend.TokenType.VIEW_OTHER_USER_PROFILE
import java.util.*

class UserProfileHandler(
        private val emailRepository: EmailRepository,
        private val acceptedTermsRepository: AcceptedTermsRepository,
        private val profileInfoRepository: ProfileInfoRepository,
        private val heightRepository: HeightRepository,
        private val weightRepository: WeightRepository,
        private val activityRepository: ActivityRepository,
        private val profileEvaluationRepository: ProfileEvaluationRepository,
        private val expiringTokenRepository: ExpiringTokenRepository,
        private val emailChangeHistoryRepository: EmailChangeHistoryRepository,
        private val profileDeletionFeedbackRepository: ProfileDeletionFeedbackRepository,
        private val userRoleRepository: UserRoleRepository,
        private val tokenDataRepository: ViewOtherUserProfileTokenDataRepository,
        private val profileViewHistoryRepository: ProfileViewHistoryRepository,
        private val datingProfileInfoRepository: DatingProfileInfoRepository,
        private val userPopulatedLocalityRepository: UserPopulatedLocalityRepository,
        private val populatedLocalitiesRepository: PopulatedLocalitiesRepository,
        private val userLanguageRepository: UserLanguageRepository,
        private val languagesRepository: LanguagesRepository,
        private val userInterestRepository: UserInterestRepository,
        private val interestsRepository: InterestsRepository,
        private val userPersonalQualityRepository: UserPersonalQualityRepository,
        private val personalQualitiesRepository: PersonalQualitiesRepository,
        private val logoutHandler: DelegatingServerLogoutHandler,
        private val passwordEncoder: PasswordEncoder,
        private val transactionalOperator: TransactionalOperator,
        private val freemarkerMailSender: FreemarkerMailSender
) {
    suspend fun createProfile(request: ServerRequest): ServerResponse {
        val validCreateProfileRequest = request.awaitBody<CreateProfileRequest>()
        val email = Email(email = validCreateProfileRequest.email, verified = false)
        val profileId = email.id
        validCreateProfileRequest.id = profileId
        val now = now()
        val acceptedTerms = AcceptedTerms(profileId = profileId, lastDateAccepted = now)
        val profileInfo = ProfileInfo(
                profileId = profileId, nickname = validCreateProfileRequest.nickname,
                gender = validCreateProfileRequest.gender,
                birthday = validCreateProfileRequest.birthday, createdAt = now, updatedAt = null
        )
        val height = Height(profileId = profileId, date = now, height = validCreateProfileRequest.height)
        val weight = Weight(profileId = profileId, date = now, weight = validCreateProfileRequest.weight)
        val activities = mutableListOf(
                Activity(profileId = profileId, name = physicalExercise.name, date = now, recurrence = validCreateProfileRequest.physicalExercise),
                Activity(profileId = profileId, name = smoking.name, date = now, recurrence = validCreateProfileRequest.smoking),
                Activity(profileId = profileId, name = alcohol.name, date = now, recurrence = validCreateProfileRequest.alcohol),
                Activity(profileId = profileId, name = computerGames.name, date = now, recurrence = validCreateProfileRequest.computerGames),
                Activity(profileId = profileId, name = gambling.name, date = now, recurrence = validCreateProfileRequest.gambling),
                Activity(profileId = profileId, name = haircut.name, date = now, recurrence = validCreateProfileRequest.haircut),
                Activity(profileId = profileId, name = hairColoring.name, date = now, recurrence = validCreateProfileRequest.hairColoring),
                Activity(profileId = profileId, name = makeup.name, date = now, recurrence = validCreateProfileRequest.makeup)
        )
        validCreateProfileRequest.intimateRelationsOutsideOfMarriage?.let {
            activities.add(
                    Activity(profileId = profileId, name = intimateRelationsOutsideOfMarriage.name, date = now, recurrence = it)
            )
        }
        validCreateProfileRequest.pornographyWatching?.let {
            activities.add(
                    Activity(profileId = profileId, name = pornographyWatching.name, date = now, recurrence = it)
            )
        }
        val profileEvaluation = ProfileEvaluation(
                sourceProfileId = profileId, targetProfileId = profileId, date = now,
                evaluation = validCreateProfileRequest.personalHealthEvaluation, comment = null
        )
        transactionalOperator.executeAndAwait {
            emailRepository.save(email)
            acceptedTermsRepository.save(acceptedTerms)
            profileInfoRepository.save(profileInfo)
            heightRepository.save(height)
            weightRepository.save(weight)
            activities.forEach { activityRepository.save(it) }
            profileEvaluationRepository.save(profileEvaluation)
            userRoleRepository.save(UserRole(profileId, Role.ROLE_USER))
            freemarkerMailSender.sendWelcomeAndVerifyEmailMessage(email.id, email.email, request)
        }
        return ok().json().bodyValueAndAwait(existingProfileById(profileId))
    }

    suspend fun profile(request: ServerRequest): ServerResponse {
        val profile = currentUserProfile(request)
        return ok().json().bodyValueAndAwait(profile)
    }

    suspend fun updateProfile(request: ServerRequest): ServerResponse {
        val profile = request.awaitBody<Profile>()
        val existingProfile = currentUserProfile(request)
        val changedEmail = changedEmail(existingProfile, profile)
        val changedProfileInfo = changedProfileInfo(existingProfile, profile)
        val changedHeight = changedHeight(existingProfile, profile)
        val changedWeight = changedWeight(existingProfile, profile)
        val changedActivities = changedActivities(existingProfile, profile)
        val changedHealthEvaluation = changedHealthEvaluation(existingProfile, profile)

        transactionalOperator.executeAndAwait {
            changedEmail?.let {
                emailRepository.update(it)
                freemarkerMailSender.sendChangeMailNotificationToOldAddress(existingProfile.email)
                val subject = "Подтверждение новой почты"
                freemarkerMailSender.generateAndSendEmailVerificationToken(
                        it.id, "ChangeEmailVerification.ftlh",
                        it.email, subject, request
                ) { link ->
                    object {
                        val title = subject
                        val actionLabel = "Подтвердить почту"
                        val actionUrl = link
                    }
                }
            }

            changedProfileInfo?.let { profileInfoRepository.update(it) }
            changedHeight?.let { heightRepository.save(it) }
            changedWeight?.let { weightRepository.save(it) }
            changedActivities.forEach { activityRepository.save(it) }
            changedHealthEvaluation?.let { profileEvaluationRepository.save(it) }
        }

        return ok().json().bodyValueAndAwait(currentUserProfile(request))
    }

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
        dbToken.verify(webToken, TokenType.ACCOUNT_REMOVAL, passwordEncoder)

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
            profileViewHistoryRepository.delete(currentUserProfileId)
            emailRepository.delete(currentUserProfileId)
            emailChangeHistoryRepository.delete(currentUserProfileId)

            // + save feedback
            profileDeletionFeedbackRepository.save(ProfileDeletionFeedback(currentUserProfileId, deleteProfileData.reason, deleteProfileData.explanationComment))
        }
        // perform logout
        logoutHandler.logout(WebFilterExchange(request.exchange()) { Mono.empty() }, principal as Authentication).awaitFirstOrNull()

        return okEmptyJsonObject()
    }

    suspend fun requestViewOfAuthorsProfile(request: ServerRequest): ServerResponse {
        // find out who is admin
        val adminProfileId = (userRoleRepository.findAdmin() ?: throw AuthorNotFoundException()).profileId
        val currentUserEmail = currentUserEmail(emailRepository, request)

        // send token
        val subject = "Ссылка для просмотра профиля автора сайта смотрины.укр & смотрины.рус"
        transactionalOperator.executeAndAwait {
            freemarkerMailSender.generateAndSendLinkWithToken(
                    currentUserEmail.id, VIEW_OTHER_USER_PROFILE, "LinkToViewOtherUserProfile.ftlh",
                    currentUserEmail.email, subject, request, "просмотр-профиля",
                    // while saving additional token payload
                    { token -> tokenDataRepository.save(ViewOtherUserProfileTokenData(token.id, adminProfileId)) }
            ) { link ->
                object {
                    val title = subject
                    val actionLabel = "Просмотр профиля"
                    val actionUrl = link
                }
            }
        }
        return okEmptyJsonObject()
    }

    suspend fun viewOtherUserProfile(request: ServerRequest): ServerResponse {
        val webToken = request.queryParam("token").map { Token(it).decode() }
                .orElseThrow { throw NoSuchTokenException() }
        val dbToken = expiringTokenRepository.findById(webToken.id) ?: throwNoSuchToken()
        dbToken.verify(webToken, VIEW_OTHER_USER_PROFILE, passwordEncoder)

        // prepare profile data view (without email)
        val tokenData = tokenDataRepository.find(dbToken.id)
        val targetProfileData = existingProfileById(tokenData.targetProfileId).also {
            it.email = "" // we're not revealing target user email here
        }

        transactionalOperator.executeAndAwait {
            // track who viewed whose profile
            profileViewHistoryRepository.save(ProfileViewHistory(dbToken.profileId, tokenData.targetProfileId, now()))
            // remove token (as it is one time only)
            expiringTokenRepository.delete(dbToken)
        }

        return ok().json().bodyValueAndAwait(targetProfileData)
    }

    suspend fun activateSecondStage(request: ServerRequest): ServerResponse {
        // verify that activation is allowed
        val currentUserProfile = currentUserProfile(request)
        if (currentUserProfile.eligibleForSecondStage != true) throw NotEligibleForSecondStageException()

        val body = request.awaitBody<SecondStageData>()
        transactionalOperator.executeAndAwait {
            datingProfileInfoRepository.save(DatingProfileInfo(currentUserProfile.id!!, body.goal, body.appearanceType, body.naturalHairColor, body.eyeColor))
            userPopulatedLocalityRepository.save(UserPopulatedLocality(currentUserProfile.id!!, body.populatedLocality.id, 0))
            body.nativeLanguages.forEachIndexed { index, language -> userLanguageRepository.save(UserLanguage(currentUserProfile.id!!, language.id, index)) }
            body.interests.forEachIndexed { index, interest -> userInterestRepository.save(UserInterest(currentUserProfile.id!!, interest.id, index)) }
            body.likedPersonalQualities.forEachIndexed { index, personalQuality -> userPersonalQualityRepository.save(UserPersonalQuality(currentUserProfile.id!!, personalQuality.id, Attitude.likes, index)) }
            body.dislikedPersonalQualities.forEachIndexed { index, personalQuality -> userPersonalQualityRepository.save(UserPersonalQuality(currentUserProfile.id!!, personalQuality.id, Attitude.dislikes, index)) }
        }
        return okEmptyJsonObject()
    }

    private fun changedHealthEvaluation(existingProfile: Profile, profile: Profile) = if (existingProfile.personalHealthEvaluation != profile.personalHealthEvaluation) {
        ProfileEvaluation(existingProfile.id!!, existingProfile.id!!, now(), profile.personalHealthEvaluation, null)
    } else {
        null
    }

    private fun changedActivities(existingProfile: Profile, profile: Profile): List<Activity> {
        val changedActivities = mutableListOf<Activity>()
        val now = now()
        if (existingProfile.physicalExercise != profile.physicalExercise) {
            changedActivities.add(Activity(existingProfile.id!!, physicalExercise.name, now, profile.physicalExercise))
        }
        if (existingProfile.smoking != profile.smoking) {
            changedActivities.add(Activity(existingProfile.id!!, smoking.name, now, profile.smoking))
        }
        if (existingProfile.alcohol != profile.alcohol) {
            changedActivities.add(Activity(existingProfile.id!!, alcohol.name, now, profile.alcohol))
        }
        if (existingProfile.computerGames != profile.computerGames) {
            changedActivities.add(Activity(existingProfile.id!!, computerGames.name, now, profile.computerGames))
        }
        if (existingProfile.gambling != profile.gambling) {
            changedActivities.add(Activity(existingProfile.id!!, gambling.name, now, profile.gambling))
        }
        if (existingProfile.haircut != profile.haircut) {
            changedActivities.add(Activity(existingProfile.id!!, haircut.name, now, profile.haircut))
        }
        if (existingProfile.hairColoring != profile.hairColoring) {
            changedActivities.add(Activity(existingProfile.id!!, hairColoring.name, now, profile.hairColoring))
        }
        if (existingProfile.makeup != profile.makeup) {
            changedActivities.add(Activity(existingProfile.id!!, makeup.name, now, profile.makeup))
        }
        if (profile.intimateRelationsOutsideOfMarriage != null && existingProfile.intimateRelationsOutsideOfMarriage != profile.intimateRelationsOutsideOfMarriage) {
            changedActivities.add(Activity(existingProfile.id!!, intimateRelationsOutsideOfMarriage.name, now, profile.intimateRelationsOutsideOfMarriage))
        }
        if (profile.pornographyWatching != null && existingProfile.pornographyWatching != profile.pornographyWatching) {
            changedActivities.add(Activity(existingProfile.id!!, pornographyWatching.name, now, profile.pornographyWatching))
        }
        return changedActivities
    }

    private fun changedWeight(existingProfile: Profile, profile: Profile) = if (existingProfile.weight != profile.weight) {
        Weight(existingProfile.id!!, now(), profile.weight)
    } else {
        null
    }

    private fun changedHeight(existingProfile: Profile, profile: Profile) = if (existingProfile.height != profile.height) {
        Height(existingProfile.id!!, now(), profile.height)
    } else {
        null
    }

    private fun changedProfileInfo(existingProfile: Profile, profile: Profile) = if (
            existingProfile.nickname != profile.nickname
            || existingProfile.gender != profile.gender
            || existingProfile.birthday != profile.birthday
    ) {
        ProfileInfo(existingProfile.id!!, profile.nickname, profile.gender, profile.birthday, null, now())
    } else {
        null
    }

    private fun changedEmail(existingProfile: Profile, profile: Profile) = if (existingProfile.email != profile.email) {
        Email(profile.email, false, existingProfile.id!!)
    } else {
        null
    }

    private suspend fun currentUserProfile(request: ServerRequest): Profile {
        val principal = request.principal().awaitFirst()
        return existingProfileById(UUID.fromString(principal.name))
    }

    private suspend fun existingProfileById(profileId: UUID): Profile {
        val email = emailRepository.findById(profileId) ?: throw EmailNotFoundException()
        val profileInfo = profileInfoRepository.findByProfileId(profileId)!!
        val height = heightRepository.findLatestByProfileId(profileId)
        val weight = weightRepository.findLatestByProfileId(profileId)
        val activityNames = listOf(
                physicalExercise.name, smoking.name, alcohol.name,
                computerGames.name, gambling.name, haircut.name,
                hairColoring.name, makeup.name, intimateRelationsOutsideOfMarriage.name,
                pornographyWatching.name
        )
        val activities = activityRepository.findLatestByProfileId(profileId, activityNames).collectMap { it.name }.awaitFirst()
        val personalHealthEvaluation = profileEvaluationRepository.findLatestHealthEvaluationByProfileId(profileId)
        return toWebEntity(email, profileInfo, height, weight, activities, personalHealthEvaluation, secondStageProfileInformation(profileId))
    }

    private suspend fun secondStageProfileInformation(profileId: UUID): SecondStageData? {
        val datingProfileInfo = datingProfileInfoRepository.find(profileId) ?: return null // return null if second stage is not enabled
        val userPopulatedLocality = userPopulatedLocalityRepository.find(profileId)
        val populatedLocality = populatedLocalitiesRepository.findById(userPopulatedLocality.populatedLocalityId)
        val userLanguages = userLanguageRepository.find(profileId)
        val nativeLanguages = languagesRepository.findAll(userLanguages.map { it.languageId })
        val userInterests = userInterestRepository.find(profileId)
        val interests = interestsRepository.findAll(userInterests.map { it.interestId })
        val userLikedPersonalQualities = userPersonalQualityRepository.find(profileId, Attitude.likes)
        val likedPersonalQualities = personalQualitiesRepository.find(userLikedPersonalQualities.map { it.personalQualityId })
        val userDislikedPersonalQualities = userPersonalQualityRepository.find(profileId, Attitude.dislikes)
        val dislikedPersonalQualities = personalQualitiesRepository.find(userDislikedPersonalQualities.map { it.personalQualityId })

        return SecondStageData(
                datingProfileInfo.goal,
                populatedLocality,
                nativeLanguages,
                datingProfileInfo.appearanceType,
                datingProfileInfo.naturalHairColor,
                datingProfileInfo.eyeColor,
                interests,
                likedPersonalQualities,
                dislikedPersonalQualities
        )
    }

    private fun toWebEntity(email: Email, profileInfo: ProfileInfo, height: Height, weight: Weight, activities: Map<String, Activity>, personalHealthEvaluation: ProfileEvaluation, secondStageProfileInformation: SecondStageData?): Profile {
        val eligibleForSecondStage = activities[intimateRelationsOutsideOfMarriage.name] !== null
                && activities[pornographyWatching.name] !== null
        return Profile(
                email.id, email.email, profileInfo.nickname, profileInfo.gender, profileInfo.birthday, height.height, weight.weight,
                activities[physicalExercise.name]!!.recurrence, activities[smoking.name]!!.recurrence,
                activities[alcohol.name]!!.recurrence, activities[computerGames.name]!!.recurrence,
                activities[gambling.name]!!.recurrence, activities[haircut.name]!!.recurrence,
                activities[hairColoring.name]!!.recurrence, activities[makeup.name]!!.recurrence,
                activities[intimateRelationsOutsideOfMarriage.name]?.recurrence, activities[pornographyWatching.name]?.recurrence,
                personalHealthEvaluation.evaluation, eligibleForSecondStage, secondStageProfileInformation
        )
    }
}

suspend fun currentUserEmail(emailRepository: EmailRepository, request: ServerRequest): Email {
    return emailRepository.findById(UUID.fromString(request.awaitPrincipal()!!.name))
            ?: throw EmailNotFoundException()
}
