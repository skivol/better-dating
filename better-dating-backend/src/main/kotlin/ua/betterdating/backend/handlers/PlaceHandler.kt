package ua.betterdating.backend.handlers

import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.server.ServerWebInputException
import ua.betterdating.backend.*
import ua.betterdating.backend.data.*
import ua.betterdating.backend.external.GoogleTimeZoneApi
import ua.betterdating.backend.external.MapboxApi
import ua.betterdating.backend.tasks.findAvailableDatingSpotsIn
import ua.betterdating.backend.tasks.generateAndSaveDateVerificationToken
import ua.betterdating.backend.utils.*
import java.util.*

open class LatLng(
    val lat: Double,
    val lng: Double,
)

class Coordinates(
    lat: Double,
    lng: Double,
    val specific: Boolean
) : LatLng(lat, lng)


class PlaceHandler(
    private val mapboxApi: MapboxApi,
    private val googleTimeZoneApi: GoogleTimeZoneApi,
    private val pairsRepository: PairsRepository,
    private val placeRepository: PlaceRepository,
    private val datesRepository: DatesRepository,
    private val emailRepository: EmailRepository,
    private val loginInformationRepository: LoginInformationRepository,
    private val expiringTokenRepository: ExpiringTokenRepository,
    private val dateVerificationTokenDataRepository: DateVerificationTokenDataRepository,
    private val passwordEncoder: PasswordEncoder,
    private val transactionalOperator: TransactionalOperator,
    private val mailSender: FreemarkerMailSender,
) {
    suspend fun resolvePopulatedLocalityCoordinatesForDate(request: ServerRequest): ServerResponse {
        val dateId = ensureCan(
            PlaceAction.AddPlace, request, dateIdFromRequest(request)
        ).first.id

        // 1. resolve place from pair
        val populatedLocality =
            pairsRepository.findPairByDate(dateId).firstProfileSnapshot!!.populatedLocality

        // use mapbox geocoding for initial positioning
        val coordinates = mapboxApi.forwardGeocoding("${populatedLocality.name} ${populatedLocality.region}") ?: {
            // or center of Ukraine/Russia/Belarus/Kazakhstan (or appropriate country in general) if couldn't find specific place coordinates
            val latLng = when (populatedLocality.country) {
                "Россия" -> arrayOf(55.633315, 37.796245)
                "Республика Беларусь" -> arrayOf(53.90175546268201, 27.55594010756711)
                "Республика Казахстан" -> arrayOf(48.154584222766196, 67.2716195873904)
                // Украина
                else -> arrayOf(49.47954694610455, 31.482421606779102)
            }
            Coordinates(latLng[0], latLng[1], false)
        }

        return ok().json().bodyValueAndAwait(coordinates)
    }

    private fun dateIdFromRequest(request: ServerRequest) =
        UUID.fromString(
            request.queryParam("dateId").orElseThrow { ServerWebInputException("no dateId parameter specified") })

    private suspend fun ensureCan(
        placeAction: PlaceAction,
        request: ServerRequest,
        dateId: UUID
    ): Pair<DateInfo, DatingPair> {
        val dateAndPair = resolveDateAndPair(datesRepository, pairsRepository, dateId)
        val (relevantDate, relevantPair) = dateAndPair
        val userId = UUID.fromString(request.awaitPrincipal()!!.name)
        val error = when (placeAction) {
            PlaceAction.AddPlace -> {
                when {
                    relevantDate.status != DateStatus.waitingForPlace -> "date does not need new place to be added"
                    userId != relevantPair.firstProfileId -> "other user should be adding place suggestion"
                    else -> null
                }
            }
            PlaceAction.VerifyPlace -> {
                when {
                    relevantDate.status != DateStatus.placeSuggested -> "date does not need new place to be approved"
                    userId != relevantPair.secondProfileId -> "other user should be checking place suggestion"
                    else -> null
                }
            }
            PlaceAction.ViewPlace -> {
                if (relevantDate.status != DateStatus.scheduled) "date is not currently scheduled"
                else null
            }
        }
        if (error != null) throw ServerWebInputException(error)
        return dateAndPair
    }

    private class AddPlaceRequest(
        val dateId: UUID,
        val name: String,
        lat: Double,
        lng: Double,
    ) : LatLng(lat, lng)
    suspend fun addPlace(request: ServerRequest): ServerResponse {
        val addPlaceRequest = request.awaitBody<AddPlaceRequest>()
        val dateId = ensureCan(PlaceAction.AddPlace, request, addPlaceRequest.dateId).first.id
        val pair = pairsRepository.findPairByDate(dateId)

        val userId = UUID.fromString(request.awaitPrincipal()!!.name)
        val place = Place(
            name = addPlaceRequest.name,
            latitude = addPlaceRequest.lat,
            longitude = addPlaceRequest.lng,
            populatedLocalityId = pair.firstProfileSnapshot!!.populatedLocality.id,
            suggestedBy = userId,
            status = PlaceStatus.waitingForApproval
        )

        // perform reverse geocoding to verify if selected point is within current populated locality
        val populatedLocality = pair.firstProfileSnapshot!!.populatedLocality
        val withinLocality = mapboxApi.pointWithinPopulatedLocality(addPlaceRequest.lat, addPlaceRequest.lng, populatedLocality)
        if (withinLocality == false) {
            throw NotInTargetPopulatedLocalityException(populatedLocality.name)
        }

        val subject = "Нужно проверить место предложенное для организации свидания"
        val secondProfileEmail = emailRepository.findById(pair.secondProfileId)!!.email
        val secondProfileLastHost = loginInformationRepository.find(pair.secondProfileId).lastHost
        transactionalOperator.executeAndAwait {
            // save while checking new point is not too close to existing other points
            val distance = 30.0
            val savedCount = placeRepository.save(place, distance)
            if (savedCount == 0) {
                checkTooClosePoints(place, distance)
            }
            datesRepository.linkWithPlace(dateId, place.id)

            // send mail to the second user
            mailSender.sendLink(
                "HelpToChooseThePlace.ftlh",
                secondProfileEmail,
                subject,
                secondProfileLastHost,
                "проверка-места?свидание=${dateId}",
            ) { link ->
                object {
                    val title = subject
                    val actionLabel = "Посмотреть место встречи"
                    val actionUrl = link
                }
            }
        }

        return okEmptyJsonObject()
    }

    private class ApprovePlaceRequest(val dateId: UUID)
    suspend fun approvePlace(request: ServerRequest): ServerResponse {
        val approvePlaceRequest = request.awaitBody<ApprovePlaceRequest>()
        val (dateInfo, pair) = ensureCan(PlaceAction.VerifyPlace, request, approvePlaceRequest.dateId)

        val place = placeRepository.byId(dateInfo.placeId!!)

        transactionalOperator.executeAndAwait {
            placeRepository.approve(dateInfo.placeId, pair.secondProfileId)
            val spots = findAvailableDatingSpotsIn(datesRepository, googleTimeZoneApi, pair.firstProfileSnapshot!!.populatedLocality)
            val whenAndWhere = spots.shuffled().first { it.place.id == dateInfo.placeId }
            val updatedDateInfo = dateInfo.copy(
                latitude = place.latitude,
                longitude = place.longitude,
                whenScheduled = whenAndWhere.timeAndDate,
                status = DateStatus.scheduled
            )
            datesRepository.upsert(updatedDateInfo)

            // notify users about scheduled date
            val firstProfileEmail = emailRepository.findById(pair.firstProfileId)!!.email
            val firstProfileLastHost = loginInformationRepository.find(pair.firstProfileId).lastHost
            val body = "$automaticDateAndTime $striveToComeToTheDate $beResponsibleAndAttentive $additionalInfoCanBeFoundOnSite"
            val secondProfile = emailRepository.findById(pair.secondProfileId)!!
            val dateVerificationToken =
                generateAndSaveDateVerificationToken(
                    secondProfile.id,
                    whenAndWhere.timeAndDate,
                    dateInfo.id,
                    passwordEncoder,
                    expiringTokenRepository,
                    dateVerificationTokenDataRepository
                )
            mailSender.dateOrganizedMessage(firstProfileEmail, whenAndWhere, bodyWithVerificationToken(body, dateVerificationToken), firstProfileLastHost)

            val secondProfileLastHost = loginInformationRepository.find(pair.secondProfileId).lastHost
            mailSender.dateOrganizedMessage(secondProfile.email, whenAndWhere, bodyMentioningVerificationToken(body), secondProfileLastHost)
        }

        return okEmptyJsonObject()
    }

    private enum class PlaceAction {
        AddPlace, VerifyPlace, ViewPlace
    }

    suspend fun getPlaceData(request: ServerRequest): ServerResponse {
        val action = when (request.queryParam("action")
            .orElseThrow { ServerWebInputException("'action' query parameter is missing") }) {
            "check" -> PlaceAction.VerifyPlace
            "view" -> PlaceAction.ViewPlace
            else -> throw ServerWebInputException("'action' query param expected values are 'check'/'view'")
        }

        val date = ensureCan(action, request, dateIdFromRequest(request)).first
        val place = placeRepository.byId(date.placeId ?: throw ServerWebInputException("No place connected to the date"))
        return ok().json().bodyValueAndAwait(
            if (date.latitude == null || (date.latitude == place.latitude && date.longitude == place.longitude)) place else LatLng(
                date.latitude,
                date.longitude!!
            )
        )
    }

    private suspend fun checkTooClosePoints(place: Place, distance: Double) {
        val tooClosePoints =
            placeRepository.fetchTooClosePoints(place.populatedLocalityId, place.longitude, place.latitude, distance)
        throw TooCloseToOtherPlacesException(tooClosePoints, distance)
    }
}

suspend fun resolveDateAndPair(datesRepository: DatesRepository, pairsRepository: PairsRepository, dateId: UUID): Pair<DateInfo, DatingPair> {
    val relevantDate =
        datesRepository.findById(dateId) ?: throw ServerWebInputException("no date with provided id was found")
    val relevantPair = pairsRepository.findPairByDate(dateId)
    return Pair(relevantDate, relevantPair)
}

