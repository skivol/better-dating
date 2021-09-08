package ua.betterdating.backend.external

import org.springframework.core.env.Environment
import org.springframework.core.env.get
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import org.springframework.web.reactive.function.client.awaitExchange
import ua.betterdating.backend.utils.LoggerDelegate
import java.time.ZonedDateTime

/**
 * Example response:
 *  {
     "dstOffset": 3600,
     "rawOffset": 7200,
     "status": "OK",
     "timeZoneId": "Europe/Kiev",
     "timeZoneName": "Eastern European Summer Time"
    }
 */
class GoogleTimeZoneApiResponse(
    val status: String,
    val errorMessage: String?,
    val timeZoneId: String?,
)
class GoogleTimeZoneApi(
    private val environment: Environment,
) {
    private val log by LoggerDelegate()
    private val googleAccessToken: String
        get() {
            return environment["google.access-token"]
                ?: throw RuntimeException("Google access token wasn't provided")
        }

    suspend fun timeZoneOf(latitude: Double, longitude: Double, timestamp: ZonedDateTime): String? = try {
        WebClient.builder().build().get()
            .uri("https://maps.googleapis.com/maps/api/timezone/json") {
                it.queryParam("key", googleAccessToken)
                    .queryParam("location", "$latitude,$longitude")
                    .queryParam("timestamp", timestamp.toEpochSecond())
                    .build()
            }
            .awaitExchange<GoogleTimeZoneApiResponse> { it.awaitBody() }
            .let {
                if (it.status == "OK") it.timeZoneId else {
                    log.warn("Error calling Google Timezone api, got status '{}', message '{}'", it.status, it.errorMessage)
                    null
                }
            }
    } catch (e: Exception) {
        log.warn("Error calling Google Timezone api", e)
        null
    }
}
