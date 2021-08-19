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
        ).dateInfo.id

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

    private data class PlaceHandlerContext(val dateInfo: DateInfo, val datingPair: DatingPair, val relevantPlaces: List<Place>, val currentUserId: UUID)
    private suspend fun ensureCan(
        placeAction: PlaceAction,
        request: ServerRequest,
        dateId: UUID
    ): PlaceHandlerContext {
        val dateAndPair = resolveDateAndPair(datesRepository, pairsRepository, dateId)
        val (relevantDate, relevantPair) = dateAndPair
        val userId = UUID.fromString(request.awaitPrincipal()!!.name)
        val relevantDatingPlaces = if (relevantDate.placeId != null) placeRepository.allById(relevantDate.placeId) else emptyList()

        val error = when (placeAction) {
            PlaceAction.AddPlace -> {
                val mostRecentPlaceSuggestedByCurrentUser = { relevantDatingPlaces.maxByOrNull { it.createdAt }?.let { it.suggestedBy == userId } ?: false }
                when {
                    !setOf(DateStatus.WaitingForPlace, DateStatus.WaitingForPlaceApproval).contains(relevantDate.status)  -> "date does not need new place to be added"
                    (relevantDatingPlaces.isEmpty() && userId != relevantPair.firstProfileId) || mostRecentPlaceSuggestedByCurrentUser() -> "other user should be adding place suggestion"
                    else -> null
                }
            }
            PlaceAction.VerifyPlace -> {
                val placeSuggestedByOtherUser = relevantDatingPlaces.firstOrNull { it.suggestedBy != userId }
                when {
                    relevantDate.status != DateStatus.WaitingForPlaceApproval -> "date does not need new place to be approved"
                    placeSuggestedByOtherUser == null -> "no place suggested by other user that can be checked"
                    else -> null
                }
            }
            PlaceAction.ViewPlace -> {
                if (!setOf(DateStatus.Scheduled, DateStatus.PartialCheckIn).contains(relevantDate.status)) "date is not currently scheduled or in partial check-in state"
                else null
            }
        }
        if (error != null) throw ServerWebInputException(error)
        return PlaceHandlerContext(relevantDate, relevantPair, relevantDatingPlaces, userId)
    }

    private class AddPlaceRequest(
        val dateId: UUID,
        val name: String,
        lat: Double,
        lng: Double,
    ) : LatLng(lat, lng)
    suspend fun addPlace(request: ServerRequest): ServerResponse {
        val addPlaceRequest = request.awaitBody<AddPlaceRequest>()
        val (dateInfo, pair, relevantPlaces, currentUserId) = ensureCan(PlaceAction.AddPlace, request, addPlaceRequest.dateId)
        val dateId = dateInfo.id

        val populatedLocality = pair.firstProfileSnapshot!!.populatedLocality
        val firstRelevantPlace = relevantPlaces.firstOrNull()

        // "version" selection logic covers more than is allowed currently
        // to avoid accidentally updating the place suggested by other user at all costs
        val version = when (relevantPlaces.size) {
            0 -> 1
            1 -> when {
                firstRelevantPlace!!.suggestedBy == currentUserId -> firstRelevantPlace.version
                firstRelevantPlace.version == 1 -> 2
                else -> 1
            }
            // 2 unsettled places
            else -> relevantPlaces.first { it.suggestedBy == currentUserId }.version
        }
        val place = Place(
            id = firstRelevantPlace?.id ?: UUID.randomUUID(),
            name = addPlaceRequest.name,
            latitude = addPlaceRequest.lat,
            longitude = addPlaceRequest.lng,
            populatedLocalityId = populatedLocality.id,
            suggestedBy = currentUserId,
            status = PlaceStatus.WaitingForApproval,
            version = version
        )

        // perform reverse geocoding to verify if selected point is within current populated locality
        val withinLocality = mapboxApi.pointWithinPopulatedLocality(addPlaceRequest.lat, addPlaceRequest.lng, populatedLocality)
        if (withinLocality == false) {
            throw NotInTargetPopulatedLocalityException(populatedLocality.name)
        }

        val suggestOtherPlaceFlow = relevantPlaces.size > 1
        val subject = "Нужно проверить ${if (suggestOtherPlaceFlow) "новое " else ""}место предложенное для организации свидания"
        val secondProfileEmail = emailRepository.findById(pair.secondProfileId)!!.email
        val secondProfileLastHost = loginInformationRepository.find(pair.secondProfileId).lastHost
        transactionalOperator.executeAndAwait {
            // save while checking new point is not too close to existing other points
            val upsertCount = placeRepository.upsert(place, distance)
            if (upsertCount == 0) {
                checkTooClosePoints(place, distance)
            }
            datesRepository.upsert(
                dateInfo.copy(
                    status = DateStatus.WaitingForPlaceApproval,
                    placeId = place.id,
                )
            )

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
        val (dateInfo, pair, relevantPlaces, currentUserId) = ensureCan(PlaceAction.VerifyPlace, request, approvePlaceRequest.dateId)
        val placeToApprove = relevantPlaces.firstOrNull { it.suggestedBy != currentUserId } ?: throw badRequestException("no place to be approved by current user was found")

        transactionalOperator.executeAndAwait {
            if (relevantPlaces.size > 1) { // we're having several place suggestions for one date (that is, in "suggest other place" flow)
                placeRepository.deleteAllById(placeToApprove.id) // delete all, because we might be changing the version of approved place to "1" in the upsert below in this case
                                                                // and we don't want the old version to hang around
            }
            val finalPlace = placeToApprove.copy(status = PlaceStatus.Approved, approvedBy = currentUserId, version = 1)
            val upsertCount = placeRepository.upsert(finalPlace, distance)
            if (upsertCount == 0) {
                checkTooClosePoints(placeToApprove, distance)
            }
            val spots = findAvailableDatingSpotsIn(datesRepository, googleTimeZoneApi, pair.firstProfileSnapshot!!.populatedLocality)
            val whenAndWhere = spots.shuffled().first { it.place.id == dateInfo.placeId }
            datesRepository.upsert(
                dateInfo.copy(
                    whenScheduled = whenAndWhere.timeAndDate,
                    status = DateStatus.Scheduled,
                    placeId = finalPlace.id,
                    placeVersion = finalPlace.version,
                )
            )

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
        val action = when (
            request.queryParam("action").orElseThrow { ServerWebInputException("'action' query parameter is missing") }
        ) {
            "check" -> PlaceAction.VerifyPlace
            "view" -> PlaceAction.ViewPlace
            else -> throw ServerWebInputException("'action' query param expected values are 'check'/'view'")
        }

        val (date, _, places, currentUserId) = ensureCan(action, request, dateIdFromRequest(request))
        if (places.isEmpty()) throw ServerWebInputException("No place connected to the date")

        val result = when (action) {
            PlaceAction.VerifyPlace -> places.first { it.suggestedBy != currentUserId }
            // ViewPlace
            else -> places.first { it.version == date.placeVersion }
        }

        return ok().json().bodyValueAndAwait(result)
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

