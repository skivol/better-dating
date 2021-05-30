package ua.betterdating.backend.tasks

import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import ua.betterdating.backend.FreemarkerMailSender
import ua.betterdating.backend.TokenType
import ua.betterdating.backend.data.*
import ua.betterdating.backend.utils.LoggerDelegate

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
            if (whenAndWhere == null) { // available place isn't found (we either don't have a place or it is already fully booked for next timeslots)
                // send a letter asking user to help out (sending a token for adding "place" along the way)
                val firstProfileEmail = emailRepository.findById(it.firstProfileId)!!
                val firstProfileLastHost = loginInformationRepository.find(it.firstProfileId).lastHost
                val subject = "Нужна помощь в выборе места для организации свидания"
                val pairId = it.id
                transactionalOperator.executeAndAwait {
                    datesRepository.save(DateInfo(pairId = pairId, status = DateStatus.waitingForPlace, placeId = null, whenScheduled = null))

                    mailSender.generateAndSendLinkWithToken(
                        firstProfileEmail.id,
                        TokenType.ADD_PLACE,
                        "HelpToChooseThePlace.ftlh",
                        firstProfileEmail.email,
                        subject,
                        firstProfileLastHost,
                        "добавление-места",
                        { }, // TODO save relevant pair id connected to token ?
                        { link -> object {
                            val title = subject
                            val actionLabel = "Предложить место встречи"
                            val actionUrl = link
                        } }
                    )
                }

                // * provide a ui for registering a place; selecting a point (Google Maps https://developers.google.com/maps/documentation/javascript/overview Billing https://cloud.google.com/maps-platform/pricing/sheet/ ?
                //          / Leaflet https://leafletjs.com/ ?) "javascript select point on map"
                //      + giving it a name
                //      + providing short motivation for selection (monument / center / known building etc, close to walking places / cafe etc)
                //      - ensure not too close to existing other points ? (50 m.)
                // * asking other user to evaluate the suggested place (if approves, continue, else suggest own, else admin needs to sort it out ?)
            } else {
                // TODO organize a date
                log.debug("Organizing a date")
            }
        }

        // Which data type for latitude and longitude? - https://stackoverflow.com/questions/8150721/which-data-type-for-latitude-and-longitude
        // PostGIS ? "postgres longitude latitude"

        // -- TODO place_rating (profile_id, place_id, score, motivation) ?
        // -- (ease of communication / finding, publicity, near cafe / parks, other criteria ?)

        // --INSERT INTO place (id, latitude, longitude, "name", "populated_locality_id")
        // --VALUES ('9d1c3f1a-a6b4-466d-89f1-26a7bbb82a3f', 49.589497, 34.551087, 'Центр Полтавы. Монумент Славы', '9d1c3f1a-a6b4-466d-89f1-26a7bbb82a3f');
        log.debug("Done!")
    }
}
