package ua.betterdating.backend.handlers

import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.server.WebFilterExchange
import org.springframework.security.web.server.authentication.logout.DelegatingServerLogoutHandler
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.*
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import ua.betterdating.backend.*
import ua.betterdating.backend.ActivityType.*
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
                profileId = profileId, gender = validCreateProfileRequest.gender,
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
            freemarkerMailSender.sendWelcomeAndVerifyEmailMessage(email.id, email.email, request)
        }
        return ServerResponse.ok().json().bodyValueAndAwait(validCreateProfileRequest)
    }

    suspend fun profile(request: ServerRequest): ServerResponse {
        val profile = currentUserProfile(request)
        return ServerResponse.ok().json().bodyValueAndAwait(profile)
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

        return ServerResponse.ok().json().bodyValueAndAwait(profile)
    }

    suspend fun requestRemoval(request: ServerRequest): ServerResponse {
        val profile = emailRepository.findById(UUID.fromString(request.awaitPrincipal()!!.name))
                ?: throw EmailNotFoundException()
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
        val payload = request.awaitBody<DeleteProfileData>()
        val principal = request.awaitPrincipal()

        // verify token
        val profileId = UUID.fromString(principal!!.name)
        val dbToken = expiringTokenRepository.findByProfileIdAndType(profileId, TokenType.ACCOUNT_REMOVAL ) ?: throwNoSuchTokenException()
        val decodedToken = Token(payload.token).decode()
        if (!passwordEncoder.matches(decodedToken.tokenValue, dbToken.encodedValue)) {
            throwNoSuchTokenException()
        }

        transactionalOperator.executeAndAwait {
            // remove profile data
            profileEvaluationRepository.delete(profileId)
            activityRepository.delete(profileId)
            weightRepository.delete(profileId)
            heightRepository.delete(profileId)
            profileInfoRepository.delete(profileId)
            acceptedTermsRepository.delete(profileId)
            expiringTokenRepository.deleteByProfileId(profileId)
            emailRepository.delete(profileId)
            emailChangeHistoryRepository.delete(profileId)

            // + save feedback
            profileDeletionFeedbackRepository.save(ProfileDeletionFeedback(profileId, payload.reason, payload.explanationComment))
        }
        // perform logout
        logoutHandler.logout(WebFilterExchange(request.exchange()) { Mono.empty() }, principal as Authentication).awaitFirstOrNull()

        return okEmptyJsonObject()
    }

    private suspend fun throwNoSuchTokenException(): Nothing {
        randomDelay(500, 4_000) // let's not reveal that token doesn't exist in the system so quickly
        throw NoSuchTokenException()
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
            existingProfile.gender != profile.gender || existingProfile.birthday != profile.birthday
    ) {
        ProfileInfo(existingProfile.id!!, profile.gender, profile.birthday, null, now())
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
        return toWebEntity(email, profileInfo, height, weight, activities, personalHealthEvaluation)
    }

    private fun toWebEntity(email: Email, profileInfo: ProfileInfo, height: Height, weight: Weight, activities: Map<String, Activity>, personalHealthEvaluation: ProfileEvaluation): Profile {
        return Profile(
                email.id, email.email, profileInfo.gender, profileInfo.birthday, height.height, weight.weight,
                activities[physicalExercise.name]!!.recurrence, activities[smoking.name]!!.recurrence,
                activities[alcohol.name]!!.recurrence, activities[computerGames.name]!!.recurrence,
                activities[gambling.name]!!.recurrence, activities[haircut.name]!!.recurrence,
                activities[hairColoring.name]!!.recurrence, activities[makeup.name]!!.recurrence,
                activities[intimateRelationsOutsideOfMarriage.name]?.recurrence, activities[pornographyWatching.name]?.recurrence,
                personalHealthEvaluation.evaluation
        )
    }
}
