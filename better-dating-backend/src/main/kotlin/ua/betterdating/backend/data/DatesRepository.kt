package ua.betterdating.backend.data

import io.r2dbc.spi.Row
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.reactive.asFlow
import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.r2dbc.core.*
import org.springframework.r2dbc.core.DatabaseClient
import ua.betterdating.backend.tasks.toUtc
import java.time.*
import java.util.*

data class WhenAndWhere(
    val timeAndDate: ZonedDateTime,
    val place: Place,
    val timeZone: ZoneId
)

data class Timeslot(
    val dayOfWeek: DayOfWeek,
    val time: LocalTime,
)

enum class DateStatus {
    waitingForPlace, placeSuggested, scheduled, partialCheckIn, fullCheckIn
}

data class DateInfo(
    @Id val id: UUID = UUID.randomUUID(),
    val pairId: UUID,
    val status: DateStatus,
    val placeId: UUID?,
    val whenScheduled: ZonedDateTime?,
    val latitude: Double?,
    val longitude: Double?,
)

class DateInfoWithPlace(
    val dateInfo: DateInfo,
    val place: Place?
)

const val nearPlaces = """
    near_places AS (
        SELECT * FROM place
        WHERE populated_locality_id = :populatedLocalityId
        AND status = 'approved'
    )
"""
class DatesRepository(
    private val client: DatabaseClient,
) {
    suspend fun findAvailableDatingPlacesIn(populatedLocalityId: UUID): List<Place> =
        client.sql("""
            WITH $nearPlaces
            SELECT *,
                ST_x(near_places.location::geometry) "longitude",
                ST_y(near_places.location::geometry) "latitude"
            FROM near_places
        """.trimIndent())
            .bind("populatedLocalityId", populatedLocalityId)
            .map { row, _ -> extractPlace(row)}
            .all().collectList().awaitFirst()
    suspend fun findTimeslots(): List<Timeslot> = client.sql("""
        SELECT * FROM timeslot
    """.trimIndent())
        .map { row, _ -> Timeslot(
            DayOfWeek.of(row["day_of_week"] as Int),
            row["time_of_day"] as LocalTime
        )}.all().collectList().awaitFirst()
    suspend fun findScheduledDatesIn(populatedLocalityId: UUID): List<DateInfo> = client.sql("""
        SELECT d.* FROM dates d
        JOIN place p ON p.id = d.place_id
        WHERE d.status = 'scheduled' AND p.populated_locality_id = :populatedLocalityId
    """.trimIndent())
        .bind("populatedLocalityId", populatedLocalityId)
        .map { row, _ -> extractDateInfo(row)}
        .all().collectList().awaitFirst()

    suspend fun upsert(dateInfo: DateInfo): Int = client.sql(
        """
            INSERT INTO dates VALUES(:id, :pairId, :status, :placeId, :whenScheduled, CASE WHEN :longitude IS NULL THEN NULL ELSE ST_MakePoint(:longitude, :latitude) END)
            ON CONFLICT (id) DO UPDATE SET pair_id = EXCLUDED.pair_id, status = EXCLUDED.status, place_id = EXCLUDED.place_id, when_scheduled = EXCLUDED.when_scheduled, location = EXCLUDED.location
        """.trimIndent()
    ).bind("id", dateInfo.id)
        .bind("pairId", dateInfo.pairId)
        .bind("status", dateInfo.status.toString())
        .bind("placeId", dateInfo.placeId)
        .bind("whenScheduled", dateInfo.whenScheduled)
        .bind("longitude", dateInfo.longitude)
        .bind("latitude", dateInfo.latitude)
        .fetch().awaitRowsUpdated()

    suspend fun linkWithPlace(dateId: UUID, placeId: UUID) = client.sql("""
        UPDATE dates SET place_id = :placeId, status = 'placeSuggested' WHERE id = :dateId
    """.trimIndent())
        .bind("dateId", dateId)
        .bind("placeId", placeId)
        .fetch().awaitRowsUpdated()

    suspend fun findRelevantDates(profileId: UUID): List<DateInfoWithPlace> = client.sql("""
        SELECT d.*, ST_x(d.location::geometry) "longitude", ST_y(d.location::geometry) "latitude",
            p.name "place_name", ST_x(p.location::geometry) "place_longitude", ST_y(p.location::geometry) "place_latitude",
            p.populated_locality_id "place_populated_locality_id", p.suggested_by "place_suggested_by",
            p.status "place_status"
        FROM dates d
        JOIN dating_pair dp ON dp.id = d.pair_id
        LEFT JOIN place p ON p.id = d.place_id
        WHERE dp.first_profile_id = :profileId OR dp.second_profile_id = :profileId
    """.trimIndent())
        .bind("profileId", profileId)
        .map { row, _ -> extractDateInfoWithPlace(row)}
        .all().collectList().awaitFirst()

    private fun extractDateInfoWithPlace(row: Row) = DateInfoWithPlace(
        extractDateInfo(row),
        if (row["place_id"] != null) extractPlace(row, "place_") else null
    )

    private fun extractDateInfo(row: Row) = DateInfo(
        row["id"] as UUID,
        row["pair_id"] as UUID,
        DateStatus.valueOf(row["status"] as String),
        row["place_id"] as UUID?,
        (row["when_scheduled"] as OffsetDateTime?)?.toZonedDateTime()?.toUtc(),
        row["latitude"] as Double?,
        row["longitude"] as Double?,
    )

    suspend fun findById(dateId: UUID) = client.sql("""
        SELECT d.*, ST_x(d.location::geometry) "longitude", ST_y(d.location::geometry) "latitude"
        FROM dates d
        WHERE d.id = :dateId
    """.trimIndent())
        .bind("dateId", dateId)
        .map { row, _ -> extractDateInfo(row)}
        .awaitSingleOrNull()

    suspend fun distanceToDateLocation(dateId: UUID, latitude: Double, longitude: Double): Double = client.sql("""
        SELECT ST_Distance(d.location, ST_MakePoint(:longitude, :latitude)) "distance"
        FROM dates d WHERE id = :dateId
    """.trimIndent())
        .bind("dateId", dateId)
        .bind("latitude", latitude)
        .bind("longitude", longitude)
        .map { row, _ -> row["distance"] as Double}
        .awaitSingle()

}