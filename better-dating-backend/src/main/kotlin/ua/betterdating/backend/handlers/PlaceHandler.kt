package ua.betterdating.backend.handlers

import kotlinx.coroutines.flow.toList
import org.springframework.core.env.Environment
import org.springframework.core.env.get
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import org.springframework.web.reactive.function.client.awaitExchange
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.server.ServerWebInputException
import ua.betterdating.backend.*
import ua.betterdating.backend.data.*
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

class FeatureContext(
    val text: String
)
class Feature(
    val center: List<Double>,
    val place_name: String,
    val text: String,
    val context: List<FeatureContext>?,
    val relevance: Float
)

class MapboxGeocodingResponse(
    val features: List<Feature>
)

class PlaceHandler(
    private val pairsRepository: PairsRepository,
    private val placeRepository: PlaceRepository,
    private val datesRepository: DatesRepository,
    private val emailRepository: EmailRepository,
    private val loginInformationRepository: LoginInformationRepository,
    private val environment: Environment,
    private val transactionalOperator: TransactionalOperator,
    private val mailSender: FreemarkerMailSender,
) {
    private val log by LoggerDelegate()
    private val mapboxAccessToken: String
        get() {
            return environment["mapbox.access-token"]
                ?: throw RuntimeException("Mapbox access token wasn't provided")
        }

    suspend fun resolvePopulatedLocalityCoordinatesForDate(request: ServerRequest): ServerResponse {
        val dateId = ensureCan(
            PlaceAction.AddPlace, request, dateIdFromRequest(request)
        ).first.id

        // 1. resolve place from pair
        val populatedLocality =
            pairsRepository.findPairByDate(dateId).firstProfileSnapshot!!.populatedLocality

        // use mapbox geocoding for initial positioning
        val coordinates = coordinatesFromMapboxGeocoding("${populatedLocality.name} ${populatedLocality.region}") ?: {
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

    private suspend fun ensureCan(placeAction: PlaceAction, request: ServerRequest, dateId: UUID): Pair<DateInfo, DatingPair> {
        val relevantDate =
            datesRepository.findById(dateId) ?: throw ServerWebInputException("no date with provided id was found")
        val relevantPair = pairsRepository.findPairByDate(dateId)
        val userId = UUID.fromString(request.awaitPrincipal()!!.name)
        when (placeAction) {
            PlaceAction.AddPlace -> {
                if (relevantDate.status != DateStatus.waitingForPlace) throw ServerWebInputException("date does not need new place to be added")
                if (userId != relevantPair.firstProfileId) throw ServerWebInputException("other user should be adding place suggestion")
            }
            PlaceAction.VerifyPlace -> {
                if (relevantDate.status != DateStatus.placeSuggested) throw ServerWebInputException("date does not need new place to be approved")
                if (userId != relevantPair.secondProfileId) throw ServerWebInputException("other user should be checking place suggestion")
            }
        }
        return Pair(relevantDate, relevantPair)
    }

    // https://docs.mapbox.com/api/search/geocoding/#example-request-forward-geocoding
    private suspend fun coordinatesFromMapboxGeocoding(placeName: String): Coordinates? {
        return try {
            WebClient.builder().build().get()
                .uri("https://api.mapbox.com/geocoding/v5/mapbox.places/$placeName.json") {
                    it.queryParam("access_token", mapboxAccessToken)
                        .queryParam("language", "uk")
                        .queryParam("types", "place,locality")
                        .build()
                }.awaitExchange<MapboxGeocodingResponse> {
                    it.awaitBody()
                }.let {
                    if (it.features.isNotEmpty()) {
                        val bestMatchFeature = it.features.maxByOrNull { f -> f.relevance } ?: return null
                        val lat = bestMatchFeature.center[1]
                        val lng = bestMatchFeature.center[0]
                        Coordinates(lat, lng, true)
                    } else null
                }
        } catch (e: Exception) {
            log.warn("Error calling Mapbox geocoding api", e)
            null
        }
    }

    private suspend fun pointWithinPopulatedLocality(lat: Double, lng: Double, populatedLocality: PopulatedLocality): Boolean? {
        val nameWithoutDetails = populatedLocality.name.substringBefore(" (")
        val containsPlace = { text: String -> text.contains(nameWithoutDetails) }
        return try {
            WebClient.builder().build().get()
                .uri("https://api.mapbox.com/geocoding/v5/mapbox.places/$lng,$lat.json") {
                    it.queryParam("access_token", mapboxAccessToken)
                        .queryParam("language", "uk")
                        .queryParam("types", "place,locality")
                        .build()
                }.awaitExchange<MapboxGeocodingResponse> {
                    it.awaitBody()
                }.let {
                    if (it.features.isNotEmpty()) {
                        it.features.any {f ->
                            containsPlace(f.text)
                                    || containsPlace(f.place_name)
                                    || (f.context?.any { c -> containsPlace(c.text) } ?: false)
                        }
                    } else false
                }
        } catch (e: Exception) {
            log.warn("Error calling Mapbox geocoding api", e)
            null
        }
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
        val withinLocality = pointWithinPopulatedLocality(addPlaceRequest.lat, addPlaceRequest.lng, populatedLocality)
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
            val spots = datesRepository.findAvailableDatingSpotsIn(pair.firstProfileSnapshot!!.populatedLocality.id).toList()
            val updatedDateInfo = dateInfo.copy(
                latitude = place.latitude,
                longitude = place.longitude,
                whenScheduled = spots.first { it.place.id == dateInfo.placeId }.timeAndDate,
                status = DateStatus.scheduled
            )
            datesRepository.upsert(updatedDateInfo)

            // notify users about scheduled date
            val firstProfileEmail = emailRepository.findById(pair.firstProfileId)!!.email
            val firstProfileLastHost = loginInformationRepository.find(pair.firstProfileId).lastHost
            val body = "$automaticDateAndTime $striveToComeToTheDate $beResponsibleAndAttentive $additionalInfoCanBeFoundOnSite"
            mailSender.dateOrganizedMessage(firstProfileEmail, dateInfo, body, firstProfileLastHost)

            val secondProfileEmail = emailRepository.findById(pair.secondProfileId)!!.email
            val secondProfileLastHost = loginInformationRepository.find(pair.secondProfileId).lastHost
            mailSender.dateOrganizedMessage(secondProfileEmail, dateInfo, body, secondProfileLastHost)
        }

        return okEmptyJsonObject()
    }

    private enum class PlaceAction {
        AddPlace, VerifyPlace
    }

    suspend fun getPlaceData(request: ServerRequest): ServerResponse {
        val date = ensureCan(
            PlaceAction.VerifyPlace, request, dateIdFromRequest(request)
        ).first
        val place = placeRepository.byId(date.placeId ?: throw ServerWebInputException("No place connected to the date"))
        return ok().json().bodyValueAndAwait(place)
    }

    private suspend fun checkTooClosePoints(place: Place, distance: Double) {
        val tooClosePoints =
            placeRepository.fetchTooClosePoints(place.populatedLocalityId, place.longitude, place.latitude, distance)
        throw TooCloseToOtherPlacesException(tooClosePoints, distance)
    }
}