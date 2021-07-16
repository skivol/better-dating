package ua.betterdating.backend.external

import org.springframework.core.env.Environment
import org.springframework.core.env.get
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import org.springframework.web.reactive.function.client.awaitExchange
import ua.betterdating.backend.data.PopulatedLocality
import ua.betterdating.backend.handlers.Coordinates
import ua.betterdating.backend.utils.LoggerDelegate

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
class MapboxApi(
    private val environment: Environment,
) {
    private val log by LoggerDelegate()

    private val mapboxAccessToken: String
        get() {
            return environment["mapbox.access-token"]
                ?: throw RuntimeException("Mapbox access token wasn't provided")
        }

    // https://docs.mapbox.com/api/search/geocoding/#example-request-forward-geocoding
    suspend fun forwardGeocoding(placeName: String): Coordinates? {
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

    suspend fun pointWithinPopulatedLocality(lat: Double, lng: Double, populatedLocality: PopulatedLocality): Boolean? {
        val nameWithoutDetails = populatedLocality.name.substringBefore(" (")
        val containsPlace = { text: String -> text.contains(nameWithoutDetails) }
        return try {
            reverseGeocoding(lng, lat).let {
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

    private suspend fun reverseGeocoding(
        lng: Double,
        lat: Double
    ) = WebClient.builder().build().get()
        .uri("https://api.mapbox.com/geocoding/v5/mapbox.places/$lng,$lat.json") {
            it.queryParam("access_token", mapboxAccessToken)
                .queryParam("language", "uk")
                .queryParam("types", "place,locality")
                .build()
        }.awaitExchange<MapboxGeocodingResponse> {
            it.awaitBody()
        }
}