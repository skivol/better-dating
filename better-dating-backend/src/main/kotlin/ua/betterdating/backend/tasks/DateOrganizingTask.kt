package ua.betterdating.backend.tasks

import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import ua.betterdating.backend.FreemarkerMailSender
import ua.betterdating.backend.data.*
import ua.betterdating.backend.utils.*

/**
 * Date status flow:
 * * waiting_for_place (after mail was sent),
 * * place_suggested (after place addition by one user),
 * * place_approved (other user approves)
 * * scheduled (place & time were settled),
 * * paused/cancelled (should it be possible for user to steer that ? for example, place change ?),
 * * finished (feedback was provided by participants)
 */
class DateOrganizingTask(
    private val pairsRepository: PairsRepository,
    private val datesRepository: DatesRepository,
    private val emailRepository: EmailRepository,
    private val loginInformationRepository: LoginInformationRepository,
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
            val whenAndWhere = datesRepository.findAvailableDatingSpotsIn(firstProfileSnapshot.populatedLocality.id).firstOrNull()
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
                val secondProfileEmail = emailRepository.findById(it.secondProfileId)!!.email
                val secondProfileLastHost = loginInformationRepository.find(it.secondProfileId).lastHost
                val body = "$automaticPlaceDateAndTime $striveToComeToTheDate $beResponsibleAndAttentive $additionalInfoCanBeFoundOnSite"
                transactionalOperator.executeAndAwait {
                    datesRepository.upsert(dateInfo)
                    mailSender.dateOrganizedMessage(firstProfileEmail, dateInfo, body, firstProfileLastHost)
                    mailSender.dateOrganizedMessage(secondProfileEmail, dateInfo, body, secondProfileLastHost)
                }
            }
        }

        log.debug("Done!")
    }
}
