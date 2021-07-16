package ua.betterdating.backend.handlers

import org.springframework.http.HttpStatus
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import ua.betterdating.backend.ApplicationException
import ua.betterdating.backend.FreemarkerMailSender
import ua.betterdating.backend.badRequestException
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
        transactionalOperator.executeAndAwait {
            checkInRepository.save(date.id, profileId, ZonedDateTime.now(UTC))
            datesRepository.upsert(date.copy(status = if (secondUserAlreadyCheckedIn) DateStatus.fullCheckIn else DateStatus.partialCheckIn))

            if (secondUserAlreadyCheckedIn) {
                val secondUserEmail = emailRepository.findById(userCheckIns[0].profileId)!!.email
                // notify first user by mail
                mailSender.sendSecondUserCheckedIn(secondUserEmail)
            }
        }

        return ok().json().bodyValueAndAwait(object {
            val secondUserAlreadyCheckedIn = secondUserAlreadyCheckedIn
        })
    }

    private fun hideSnapshots(datingPair: DatingPair) {
        datingPair.firstProfileSnapshot = null
        datingPair.secondProfileSnapshot = null
    }
}