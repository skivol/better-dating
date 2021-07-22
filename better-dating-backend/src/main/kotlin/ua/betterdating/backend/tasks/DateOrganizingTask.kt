package ua.betterdating.backend.tasks

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import org.springframework.http.HttpStatus
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import ua.betterdating.backend.ApplicationException
import ua.betterdating.backend.FreemarkerMailSender
import ua.betterdating.backend.data.*
import ua.betterdating.backend.external.GoogleTimeZoneApi
import ua.betterdating.backend.lazyRandom
import ua.betterdating.backend.utils.*
import java.time.*
import java.time.temporal.ChronoField
import java.util.*

/**
 * Date status flow:
 * * waiting_for_place (after mail was sent),
 * * place_suggested (after place addition by one user),
 * * scheduled (place & time were settled),
 * * paused/cancelled (should it be possible for user to steer that ? for example, place change ?),
 * * finished (feedback was provided by participants)
 */
class DateOrganizingTask(
    private val googleTimeZoneApi: GoogleTimeZoneApi,
    private val pairsRepository: PairsRepository,
    private val datesRepository: DatesRepository,
    private val emailRepository: EmailRepository,
    private val loginInformationRepository: LoginInformationRepository,
    private val expiringTokenRepository: ExpiringTokenRepository,
    private val dateVerificationTokenDataRepository: DateVerificationTokenDataRepository,
    private val passwordEncoder: PasswordEncoder,
    private val transactionalOperator: TransactionalOperator,
    private val mailSender: FreemarkerMailSender,
) {
    private val log by LoggerDelegate()

    @Scheduled(fixedDelayString = "PT5m") // run constantly with 5 minutes pause
    fun organizeDates() {
        runBlocking {
            doOrganize()
        }
    }

    private suspend fun doOrganize() {
        log.debug("Organizing dates!")

        // fetch active pairs without date
        val activePairsWithoutDates = pairsRepository.findActivePairsWithoutDates()
        activePairsWithoutDates.collect {
            log.debug("Processing {} pair", it.id)

            // * lookup available place in that populated locality + free timeslot (for example, nearest saturday / sunday midday)
            val firstProfileSnapshot = it.firstProfileSnapshot!!
            val whenAndWhere = findAvailableDatingSpotsIn(
                datesRepository,
                googleTimeZoneApi,
                firstProfileSnapshot.populatedLocality
            ).shuffled().firstOrNull()
            val pairId = it.id
            val firstProfileEmail = emailRepository.findById(it.firstProfileId)!!.email
            val firstProfileLastHost = loginInformationRepository.find(it.firstProfileId).lastHost
            if (whenAndWhere == null) { // available place isn't found (we either don't have a place or it is already fully booked for next timeslots)
                // send a letter asking user to help out
                val subject = "Нужна помощь в выборе места для организации свидания"
                val dateInfo = DateInfo(
                    pairId = pairId,
                    status = DateStatus.waitingForPlace,
                    placeId = null,
                    whenScheduled = null,
                    latitude = null,
                    longitude = null
                )
                transactionalOperator.executeAndAwait {
                    datesRepository.upsert(dateInfo)
                    mailSender.sendLink(
                        "HelpToChooseThePlace.ftlh",
                        firstProfileEmail,
                        subject,
                        firstProfileLastHost,
                        "добавление-места?свидание=${dateInfo.id}",
                    ) { link ->
                        object {
                            val title = subject
                            val actionLabel = "Предложить место встречи"
                            val actionUrl = link
                        }
                    }
                }
            } else {
                // organize a date directly
                log.debug("Organizing a date (place & time is available)")

                val dateInfo = DateInfo(
                    pairId = pairId,
                    status = DateStatus.scheduled,
                    placeId = whenAndWhere.place.id,
                    whenScheduled = whenAndWhere.timeAndDate,
                    latitude = whenAndWhere.place.latitude,
                    longitude = whenAndWhere.place.longitude
                )
                val secondProfile = emailRepository.findById(it.secondProfileId)!!
                val secondProfileEmail = secondProfile.email
                val secondProfileLastHost = loginInformationRepository.find(it.secondProfileId).lastHost
                val body =
                    "$automaticPlaceDateAndTime $striveToComeToTheDate $beResponsibleAndAttentive $additionalInfoCanBeFoundOnSite"
                transactionalOperator.executeAndAwait {
                    datesRepository.upsert(dateInfo)

                    val dateVerificationToken =
                        generateAndSaveDateVerificationToken(
                            secondProfile.id,
                            whenAndWhere.timeAndDate,
                            dateInfo.id,
                            passwordEncoder,
                            expiringTokenRepository,
                            dateVerificationTokenDataRepository
                        )

                    mailSender.dateOrganizedMessage(
                        firstProfileEmail,
                        whenAndWhere,
                        bodyWithVerificationToken(body, dateVerificationToken),
                        firstProfileLastHost
                    )
                    mailSender.dateOrganizedMessage(secondProfileEmail, whenAndWhere, bodyMentioningVerificationToken(body), secondProfileLastHost)
                }
            }
        }

        log.debug("Done!")
    }
}

suspend fun findAvailableDatingSpotsIn(
    datesRepository: DatesRepository,
    googleTimeZoneApi: GoogleTimeZoneApi,
    populatedLocality: PopulatedLocality
): List<WhenAndWhere> {
    val populatedLocalityId = populatedLocality.id
    val availableDatingPlaces = datesRepository.findAvailableDatingPlacesIn(populatedLocalityId)
    if (availableDatingPlaces.isEmpty()) return emptyList()

    val timeslots = datesRepository.findTimeslots()

    val examplePlace = availableDatingPlaces[0]
    val timeZone = ZoneId.of(
        googleTimeZoneApi.timeZoneOf(examplePlace.latitude, examplePlace.longitude, ZonedDateTime.now())
            ?: resolveKnownTimezones(populatedLocality) ?: throw ApplicationException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "could not resolve time zone"
            )
    )

    val localizedNow = LocalDate.now(timeZone)
    val utcTimeSlots = timeslots.map {
        ZonedDateTime.of(
            localizedNow.plusWeeks(if (localizedNow.dayOfWeek >= it.dayOfWeek) 1 else 0)
                .with(ChronoField.DAY_OF_WEEK, it.dayOfWeek.value.toLong()),
            it.time,
            timeZone
        ).toUtc()
    }

    val scheduledDates = datesRepository.findScheduledDatesIn(populatedLocalityId)
    return availableDatingPlaces.cartesianProduct(utcTimeSlots) { place, time ->
        WhenAndWhere(time, place, timeZone)
    }.filter { slot -> scheduledDates.none { slot.place.id == it.placeId && slot.timeAndDate == it.whenScheduled } }
        .toList()
}

suspend fun generateAndSaveDateVerificationToken(
    tokenUserProfileId: UUID,
    scheduledDateTime: ZonedDateTime,
    dateId: UUID,
    passwordEncoder: PasswordEncoder,
    expiringTokenRepository: ExpiringTokenRepository,
    dateVerificationTokenDataRepository: DateVerificationTokenDataRepository,
): String {
    val dateVerificationToken =
        withContext(Dispatchers.Default) { lazyRandom.nextInt(999_999_999).toString() }
    val expiringToken = ExpiringToken(
        profileId = tokenUserProfileId, expires = scheduledDateTime.plusDays(2).toLocalDateTime(),
        encodedValue = passwordEncoder.encode(dateVerificationToken), type = TokenType.DATE_VERIFICATION
    )
    expiringTokenRepository.deleteByProfileIdAndTypeIfAny(tokenUserProfileId, TokenType.DATE_VERIFICATION)
    expiringTokenRepository.save(expiringToken)
    dateVerificationTokenDataRepository.save(DateVerificationTokenData(expiringToken.id, dateId))
    return dateVerificationToken
}

fun resolveKnownTimezones(populatedLocality: PopulatedLocality) = when (populatedLocality.country) {
    "Республика Беларусь" -> "Europe/Minsk"
    "Україна" -> "Europe/Kiev"
    else -> null
}

fun ZonedDateTime.toUtc(): ZonedDateTime = this.withZoneSameInstant(ZoneOffset.UTC)
