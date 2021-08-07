package ua.betterdating.backend.handlers

import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.valiktor.functions.hasSize
import org.valiktor.validate
import ua.betterdating.backend.*
import ua.betterdating.backend.data.*
import ua.betterdating.backend.utils.okEmptyJsonObject
import java.time.Instant
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.util.*

class DatingData(val pairs: List<FullDatingPairInfo>, val dates: List<FullDateInfo>)

class DatingHandler(
    private val pairsRepository: PairsRepository,
    private val datesRepository: DatesRepository,
    private val checkInRepository: CheckInRepository,
    private val emailRepository: EmailRepository,
    private val passwordEncoder: PasswordEncoder,
    private val expiringTokenRepository: ExpiringTokenRepository,
    private val dateVerificationTokenDataRepository: DateVerificationTokenDataRepository,
    private val profileInfoRepository: ProfileInfoRepository,
    private val profileCredibilityRepository: ProfileCredibilityRepository,
    private val profileImprovementRepository: ProfileImprovementRepository,
    private val loginInformationRepository: LoginInformationRepository,
    private val transactionalOperator: TransactionalOperator,
    private val mailSender: FreemarkerMailSender,
) {
    suspend fun datingData(request: ServerRequest): ServerResponse {
        val user = request.awaitPrincipal()
        val profileId = UUID.fromString(user!!.name)
        val relevantPairs = pairsRepository.findRelevantPairs(profileId).onEach { hideSnapshots(it.datingPair) }
        val relevantDates = datesRepository.findRelevantDates(profileId)
        return ok().json().bodyValueAndAwait(DatingData(relevantPairs, relevantDates))
    }

    private class CheckInRequest(
        val dateId: UUID,
        val latitude: Double,
        val longitude: Double,
        val timestamp: ZonedDateTime,
    )

    suspend fun checkIn(request: ServerRequest): ServerResponse {
        val checkInRequest = request.awaitBody<CheckInRequest>()
        val profileId = UUID.fromString(request.awaitPrincipal()!!.name)

        val (date, pair) = resolveDateAndPair(datesRepository, pairsRepository, checkInRequest.dateId)
        if (pair.firstProfileId != profileId && pair.secondProfileId != profileId) throw badRequestException("no date with provided id was found")
        if (date.status != DateStatus.Scheduled && date.status != DateStatus.PartialCheckIn) throw badRequestException("date is not in scheduled or partial check-in state")

        val userLocationDataTimeUtc = checkInRequest.timestamp.toInstant()
        val nowUtc = Instant.now()
        if (userLocationDataTimeUtc.isBefore(nowUtc.minus(10, ChronoUnit.MINUTES))) throw badRequestException("location data is too old")
        if (nowUtc.isBefore(userLocationDataTimeUtc)) throw badRequestException("user timestamp is from future")

        val dateScheduledUtc = date.whenScheduled!!.toInstant()
        if (nowUtc.isBefore(
                dateScheduledUtc.minus(
                    10,
                    ChronoUnit.MINUTES
                )
            )
        ) throw badRequestException("too early to check in")
        if (nowUtc.isAfter(
                dateScheduledUtc.plus(
                    10,
                    ChronoUnit.MINUTES
                )
            )
        ) throw badRequestException("too late to check in")

        val distance =
            datesRepository.distanceToDateLocation(date.id, checkInRequest.latitude, checkInRequest.longitude)
        val distanceThreshold = 10
        if (distance > distanceThreshold) throw ApplicationException(
            HttpStatus.BAD_REQUEST,
            "not close enough to check in",
            details = mapOf("currentDistance" to distance, "distanceThreshold" to distanceThreshold)
        )

        val userCheckIns = checkInRepository.fetch(date.id)
        if (userCheckIns.any { it.profileId == profileId }) throw badRequestException("already checked in")

        val secondUserAlreadyCheckedIn = userCheckIns.size == 1
        val updatedDate =
            date.copy(status = if (secondUserAlreadyCheckedIn) DateStatus.FullCheckIn else DateStatus.PartialCheckIn)
        transactionalOperator.executeAndAwait {
            checkInRepository.save(date.id, profileId, ZonedDateTime.now(UTC))
            datesRepository.upsert(updatedDate)

            if (secondUserAlreadyCheckedIn) {
                val secondUserEmail = emailRepository.findById(userCheckIns[0].profileId)!!.email
                // notify first user by mail
                mailSender.sendSecondUserCheckedIn(secondUserEmail)
            }
        }

        return ok().json().bodyValueAndAwait(object {
            val dateStatus = updatedDate.status
        })
    }

    private data class VerifyDateRequest(val code: Int, val dateId: UUID)

    suspend fun verifyDate(request: ServerRequest): ServerResponse {
        val verifyDateRequest = request.awaitBody<VerifyDateRequest>()
        val profileId = UUID.fromString(request.awaitPrincipal()!!.name)

        val (date, pair) = resolveDateAndPair(datesRepository, pairsRepository, verifyDateRequest.dateId)
        if (pair.firstProfileId != profileId && pair.secondProfileId != profileId) throw badRequestException("no date with provided id was found")
        if (!setOf(DateStatus.Scheduled, DateStatus.PartialCheckIn, DateStatus.FullCheckIn).contains(date.status)) throw badRequestException("date is not in scheduled or partial/full check-in state")

        val dateScheduledUtc = date.whenScheduled!!.toInstant()
        if (Instant.now().isBefore(dateScheduledUtc)) throw badRequestException("too early to verify the date")

        val expiringToken =
            (dateVerificationTokenDataRepository.findToken(verifyDateRequest.dateId) ?: throwNoSuchToken()).also {
                if (it.profileId != profileId) throw badRequestException("other user should be verifying the date")
                it.verify(verifyDateRequest.code.toString(), TokenType.DATE_VERIFICATION, passwordEncoder)
            }

        val userToNotify = emailRepository.findById(if (pair.firstProfileId == expiringToken.profileId) pair.secondProfileId else pair.firstProfileId)!!.email
        val nameOfUserWhoVerifies = profileInfoRepository.findByProfileId(expiringToken.profileId)!!.nickname
        val updatedDate = date.copy(status = DateStatus.Verified)
        transactionalOperator.executeAndAwait {
            datesRepository.upsert(updatedDate)
            expiringTokenRepository.delete(expiringToken)
            mailSender.sendDateVerified(userToNotify, nameOfUserWhoVerifies)
        }

        return ok().json().bodyValueAndAwait(object {
            val dateStatus = updatedDate.status
        })
    }

    private data class EvaluateProfileRequest(
        val dateId: UUID,
        val credibilityCategory: CredibilityCategory, val credibilityExplanationComment: String?,
        val improvementCategory: ImprovementCategory, val improvementExplanationComment: String?,
    ) {
        init {
            validate(this) {
                validate(EvaluateProfileRequest::credibilityExplanationComment).hasSize(max = 255)
                validate(EvaluateProfileRequest::improvementExplanationComment).hasSize(max = 255)
            }
        }
    }

    suspend fun evaluateProfile(request: ServerRequest): ServerResponse {
        val payload = request.awaitBody<EvaluateProfileRequest>()
        val (date, pair) = resolveDateAndPair(datesRepository, pairsRepository, payload.dateId)
        if (date.status != DateStatus.Verified) throw badRequestException("date is not in verified state")

        val currentUserId = UUID.fromString(request.awaitPrincipal()!!.name)
        val targetProfileId = if (pair.firstProfileId == currentUserId) pair.secondProfileId else pair.firstProfileId
        val targetUserEmail = emailRepository.findById(targetProfileId)!!.email
        val lastHost = loginInformationRepository.find(targetProfileId).lastHost
        val currentUserName = profileInfoRepository.findByProfileId(currentUserId)!!.nickname

        transactionalOperator.executeAndAwait {
            val createdAt = Instant.now()
            profileCredibilityRepository.save(ProfileCredibility(date.id, currentUserId, targetProfileId, payload.credibilityCategory, payload.credibilityExplanationComment, createdAt))
            profileImprovementRepository.save(ProfileImprovement(date.id, currentUserId, targetProfileId, payload.improvementCategory, payload.improvementExplanationComment, createdAt))

            val subject = "Пользователем $currentUserName добавлена оценка правдивости профиля и предложения по его улучшению"
            mailSender.sendLink("TitleBodyAndLinkMessage.ftlh", targetUserEmail, subject, lastHost, "свидания") { link ->
                object {
                    val title = subject
                    val actionLabel = "Свидания"
                    val actionUrl = link
                    val body = "Оценку можно посмотреть в меню соответствующего свидания."
                }
            }
        }
        return okEmptyJsonObject()
    }

    private fun hideSnapshots(datingPair: DatingPair) {
        datingPair.firstProfileSnapshot = null
        datingPair.secondProfileSnapshot = null
    }
}