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
import ua.betterdating.backend.external.GoogleTimeZoneApi
import ua.betterdating.backend.tasks.findAvailableDatingSpotsIn
import ua.betterdating.backend.utils.formatDateTime
import java.time.*
import java.time.ZoneOffset.UTC
import java.time.temporal.ChronoField
import java.time.temporal.ChronoUnit
import java.util.*

class DatingData(val pairs: List<FullDatingPairInfo>, val dates: List<FullDateInfo>)

class DatingHandler(
    private val googleTimeZoneApi: GoogleTimeZoneApi,
    private val pairsRepository: PairsRepository,
    private val pairLockRepository: PairLockRepository,
    private val datesRepository: DatesRepository,
    private val checkInRepository: CheckInRepository,
    private val emailRepository: EmailRepository,
    private val placeRepository: PlaceRepository,
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
        if (!setOf(DateStatus.Scheduled, DateStatus.Rescheduled, DateStatus.PartialCheckIn).contains(date.status)) throw badRequestException("date is not in scheduled or partial check-in state")

        val userLocationDataTimeUtc = checkInRequest.timestamp.toInstant()
        val nowUtc = Instant.now()
        if (userLocationDataTimeUtc.isBefore(nowUtc.minus(10, ChronoUnit.MINUTES))) throw badRequestException("location data is too old")
        if (nowUtc.isBefore(userLocationDataTimeUtc)) throw badRequestException("user timestamp is from future")

        val distance =
            datesRepository.distanceToDateLocation(date.id, checkInRequest.latitude, checkInRequest.longitude)
        val distanceThreshold = 10
        if (distance > distanceThreshold) throw ApplicationException(
            HttpStatus.BAD_REQUEST,
            "not close enough to check in",
            details = mapOf("currentDistance" to distance, "distanceThreshold" to distanceThreshold)
        )

        val dateScheduledUtc = date.whenScheduled!!.toInstant()
        val checkInOpensAt = checkInOpensAt(dateScheduledUtc)
        if (nowUtc.isBefore(checkInOpensAt)) throw ApplicationException(
            HttpStatus.BAD_REQUEST, "too early to check in", details = mapOf(
                "minutesToGo" to Duration.ofMillis(checkInOpensAt.toEpochMilli() - nowUtc.toEpochMilli()).toMinutes()
            )
        )
        val checkInClosesAt = dateScheduledUtc.plus(10, ChronoUnit.MINUTES)
        if (nowUtc.isAfter(checkInClosesAt)) throw ApplicationException(HttpStatus.BAD_REQUEST, "too late to check in", details = mapOf(
            "minutesOverdue" to Duration.ofMillis(nowUtc.toEpochMilli() - checkInClosesAt.toEpochMilli()).toMinutes()
        ))

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

    private fun checkInOpensAt(dateScheduledUtc: Instant) = dateScheduledUtc.minus(10, ChronoUnit.MINUTES)

    private data class VerifyDateRequest(val code: Int, val dateId: UUID)

    suspend fun verifyDate(request: ServerRequest): ServerResponse {
        val verifyDateRequest = request.awaitBody<VerifyDateRequest>()
        val profileId = UUID.fromString(request.awaitPrincipal()!!.name)

        val (date, pair) = resolveDateAndPair(datesRepository, pairsRepository, verifyDateRequest.dateId)
        if (pair.firstProfileId != profileId && pair.secondProfileId != profileId) throw badRequestException("no date with provided id was found")
        if (!setOf(DateStatus.Scheduled, DateStatus.Rescheduled, DateStatus.PartialCheckIn, DateStatus.FullCheckIn).contains(date.status)) throw badRequestException("date is not in scheduled or partial/full check-in state")

        val dateScheduledUtc = date.whenScheduled!!.toInstant()
        if (Instant.now().isBefore(dateScheduledUtc)) throw badRequestException("too early to verify the date")

        val (dateVerificationTokenData, expiringToken) = dateVerificationTokenDataRepository.findToken(verifyDateRequest.dateId) ?: throwNoSuchToken()
        if (dateVerificationTokenData.verificationAttempts >= 100) throw badRequestException("verification attempts limit exceeded")
        dateVerificationTokenDataRepository.update(dateVerificationTokenData.copy(verificationAttempts = dateVerificationTokenData.verificationAttempts + 1))
        expiringToken.also {
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

        val createdAt = Instant.now()
        val profileCredibility = ProfileCredibility(
            date.id,
            currentUserId,
            targetProfileId,
            payload.credibilityCategory,
            payload.credibilityExplanationComment,
            createdAt
        )
        val profileImprovement = ProfileImprovement(
            date.id,
            currentUserId,
            targetProfileId,
            payload.improvementCategory,
            payload.improvementExplanationComment,
            createdAt
        )
        transactionalOperator.executeAndAwait {
            profileCredibilityRepository.save(profileCredibility)
            profileImprovementRepository.save(profileImprovement)

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
        return ok().json().bodyValueAndAwait(object {
            val otherCredibility = profileCredibility
            val otherImprovement = profileImprovement
        })
    }

    class RescheduleDatePayload(val dateId: UUID)
    suspend fun rescheduleDate(request: ServerRequest): ServerResponse {
        val payload = request.awaitBody<RescheduleDatePayload>()
        val currentUserId = UUID.fromString(request.awaitPrincipal()!!.name)
        val (date, pair) = resolveDateAndPair(datesRepository, pairsRepository, payload.dateId)

        if (!setOf(DateStatus.Scheduled, DateStatus.Rescheduled).contains(date.status)) throw badRequestException("date is not in scheduled state")
        if (checkInOpensAt(date.whenScheduled!!.toInstant()).isBefore(Instant.now())) throw badRequestException("cannot reschedule when check in was already opened")
        if (date.rescheduledBy?.contains(currentUserId) == true) throw badRequestException("you already rescheduled once")

        val nextWeekMonday = { zoneId: ZoneId -> LocalDate.now(zoneId).plusWeeks(1).with(ChronoField.DAY_OF_WEEK, DayOfWeek.MONDAY.value.toLong()) }
        val spots = findAvailableDatingSpotsIn(datesRepository, googleTimeZoneApi, pair.firstProfileSnapshot!!.populatedLocality, nextWeekMonday)
        if (spots.isEmpty()) throw badRequestException("no dating spots available at the moment") // won't start "add location" flow here for now

        // prefer same place & other time if available
        val spotsShuffled = spots.shuffled()
        val newSpot = spotsShuffled.firstOrNull { it.place.id == date.placeId && it.timeAndDate != date.whenScheduled }
            ?: spotsShuffled.firstOrNull { it.timeAndDate != date.whenScheduled }
            ?: spotsShuffled.first()

        val targetProfileId = if (pair.firstProfileId == currentUserId) pair.secondProfileId else pair.firstProfileId
        val targetUserEmail = emailRepository.findById(targetProfileId)!!.email
        val lastHost = loginInformationRepository.find(targetProfileId).lastHost
        val currentUserName = profileInfoRepository.findByProfileId(currentUserId)!!.nickname

        val updatedDate = date.copy(
            status = DateStatus.Rescheduled,
            rescheduledBy = (date.rescheduledBy ?: arrayOf()) + currentUserId,
            placeId = newSpot.place.id,
            placeVersion = newSpot.place.version,
            whenScheduled = newSpot.timeAndDate,
        )
        val placeChanged = date.placeId != updatedDate.placeId
        val place = if (placeChanged) placeRepository.allById(updatedDate.placeId!!).maxByOrNull { it.version } else null
        transactionalOperator.executeAndAwait {
            datesRepository.upsert(updatedDate)

            // notify other user about rescheduling
            val subject = "Пользователь $currentUserName перенес свидание !${if (placeChanged) " Внимание! Место встречи также изменилось!" else ""}"
            mailSender.sendLink("TitleBodyAndLinkMessage.ftlh", targetUserEmail, subject, lastHost, "свидания") { link ->
                object {
                    val title = subject
                    val actionLabel = "Свидания"
                    val actionUrl = link
                    val body = "Свидание теперь запланировано на ${formatDateTime(newSpot)} (предыдущее время было - ${formatDateTime(date.whenScheduled.withZoneSameInstant(newSpot.timeZone))})." +
                            if (placeChanged) " Подробности о новом месте встречи можно найти на сайте." else ""
                }
            }
        }

        return ok().json().bodyValueAndAwait(object {
            val date = updatedDate
            val place = place
        })
    }

    class CancelDatePayload(val dateId: UUID)
    suspend fun cancelDate(request: ServerRequest): ServerResponse {
        val payload = request.awaitBody<CancelDatePayload>()
        val currentUserId = UUID.fromString(request.awaitPrincipal()!!.name)
        val (date, pair) = resolveDateAndPair(datesRepository, pairsRepository, payload.dateId)

        if (!setOf(DateStatus.Scheduled, DateStatus.Rescheduled).contains(date.status)) throw badRequestException("date is not in scheduled state")
        if (checkInOpensAt(date.whenScheduled!!.toInstant()).isBefore(Instant.now())) throw badRequestException("cannot cancel when check in was already opened")

        val updatedDate = date.copy(status = DateStatus.Cancelled, cancelledBy = currentUserId)
        val otherUserId = if (pair.firstProfileId == currentUserId) pair.secondProfileId else pair.firstProfileId
        val otherUserEmail = emailRepository.findById(otherUserId)!!.email
        val currentUserNickname = profileInfoRepository.findByProfileId(currentUserId)!!.nickname

        val updatedPair = pair.copy(active = false)

        transactionalOperator.executeAndAwait {
            // cancel the date and track who did that
            datesRepository.upsert(updatedDate)

            // make it possible for other user to participate in pair matching again
            pairLockRepository.delete(DatingPairLock(otherUserId)) // unlock for further participation in pair matching if needed
            // make pair inactive
            pairsRepository.update(updatedPair)

            // notify other user
            mailSender.sendSecondUserCancelledDate(currentUserNickname, otherUserEmail)
        }

        return ok().json().bodyValueAndAwait(object {
            val dateStatus = updatedDate.status
            val pairActive = updatedPair.active
        })
    }

    private fun hideSnapshots(datingPair: DatingPair) {
        datingPair.firstProfileSnapshot = null
        datingPair.secondProfileSnapshot = null
    }
}