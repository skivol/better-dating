package ua.betterdating.backend.handlers

import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import ua.betterdating.backend.*
import ua.betterdating.backend.data.*
import ua.betterdating.backend.tasks.toUtc
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.util.*

class DatingData(val pairs: List<DatingPairWithNicknames>, val dates: List<DateInfoWithPlace>)

class DatingHandler(
    private val pairsRepository: PairsRepository,
    private val datesRepository: DatesRepository,
    private val checkInRepository: CheckInRepository,
    private val emailRepository: EmailRepository,
    private val passwordEncoder: PasswordEncoder,
    private val expiringTokenRepository: ExpiringTokenRepository,
    private val dateVerificationTokenDataRepository: DateVerificationTokenDataRepository,
    private val profileInfoRepository: ProfileInfoRepository,
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
        if (date.status != DateStatus.scheduled && date.status != DateStatus.partialCheckIn) throw badRequestException("date is not in scheduled or partial check-in state")

        val userLocationDataTimeUtc = checkInRequest.timestamp.toUtc()
        val nowUtc = ZonedDateTime.now().toUtc()
        if (userLocationDataTimeUtc.isBefore(nowUtc.minusMinutes(10))) throw badRequestException("location data is too old")
        if (nowUtc.isBefore(userLocationDataTimeUtc)) throw badRequestException("user timestamp is from future")

        val dateScheduledUtc = date.whenScheduled!!
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
            date.copy(status = if (secondUserAlreadyCheckedIn) DateStatus.fullCheckIn else DateStatus.partialCheckIn)
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
        if (!setOf(DateStatus.scheduled, DateStatus.partialCheckIn, DateStatus.fullCheckIn).contains(date.status)) throw badRequestException("date is not in scheduled or partial/full check-in state")

        val dateScheduledUtc = date.whenScheduled!!
        if (ZonedDateTime.now(UTC).isBefore(dateScheduledUtc)) throw badRequestException("too early to verify the date")

        val expiringToken =
            (dateVerificationTokenDataRepository.findToken(verifyDateRequest.dateId) ?: throwNoSuchToken()).also {
                if (it.profileId != profileId) throw badRequestException("other user should be verifying the date")
                it.verify(verifyDateRequest.code.toString(), TokenType.DATE_VERIFICATION, passwordEncoder)
            }

        val userToNotify = emailRepository.findById(if (pair.firstProfileId == expiringToken.profileId) pair.secondProfileId else pair.firstProfileId)!!.email
        val nameOfUserWhoVerifies = profileInfoRepository.findByProfileId(expiringToken.profileId)!!.nickname
        val updatedDate = date.copy(status = DateStatus.verified)
        transactionalOperator.executeAndAwait {
            datesRepository.upsert(updatedDate)
            expiringTokenRepository.delete(expiringToken)
            mailSender.sendDateVerified(userToNotify, nameOfUserWhoVerifies)
        }

        return ok().json().bodyValueAndAwait(object {
            val dateStatus = updatedDate.status
        })
    }

    private fun hideSnapshots(datingPair: DatingPair) {
        datingPair.firstProfileSnapshot = null
        datingPair.secondProfileSnapshot = null
    }
}