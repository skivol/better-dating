package ua.betterdating.backend.data

import io.r2dbc.spi.Row
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.reactive.asFlow
import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitRowsUpdated
import org.springframework.r2dbc.core.awaitSingleOrNull
import org.springframework.r2dbc.core.bind
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.util.*

data class WhenAndWhere(
    val timeAndDate: LocalDateTime,
    val place: Place,
)

enum class DateStatus {
    waitingForPlace, placeSuggested, scheduled
}

data class DateInfo(
    @Id val id: UUID = UUID.randomUUID(),
    val pairId: UUID,
    val status: DateStatus,
    val placeId: UUID?,
    val whenScheduled: LocalDateTime?,
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
    private val template: R2dbcEntityTemplate,
) {
    fun findAvailableDatingSpotsIn(populatedLocalityId: UUID) =
        client.sql("""
            WITH $nearPlaces, next_timeslots AS (
                SELECT
                    date_trunc('day', now()) + interval '1 day' * ((
                        CASE WHEN (extract(isodow from now()) >= day_of_week)
                        THEN day_of_week + 7
                        ELSE day_of_week END
                    ) - extract(isodow from now())) + "time_of_day" "scheduled_time",
                    near_places.id "scheduled_place_id", near_places."name" "scheduled_place_name",
                    ST_x(near_places.location::geometry) "scheduled_place_longitude", ST_y(near_places.location::geometry) "scheduled_place_latitude",
                    near_places.populated_locality_id "scheduled_place_populated_locality_id", near_places.suggested_by "scheduled_place_suggested_by",
                    near_places.status "scheduled_place_status"
                FROM timeslot, near_places
            )
            SELECT nt.* FROM next_timeslots nt
            LEFT JOIN dates d ON d.when_scheduled = scheduled_time AND d.place_id = scheduled_place_id
            WHERE d.id IS NULL
            """.trimIndent()
        ).bind("populatedLocalityId", populatedLocalityId)
            .map { row, _ -> extractWhenAndWhere(row)}
            .all().asFlow()

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

    private fun extractWhenAndWhere(row: Row) = WhenAndWhere(
        (row["scheduled_time"] as OffsetDateTime).toLocalDateTime(), extractPlace(row, "scheduled_place_")
    )

    private fun extractDateInfoWithPlace(row: Row) = DateInfoWithPlace(
        extractDateInfo(row),
        if (row["place_id"] != null) extractPlace(row, "place_") else null
    )

    private fun extractDateInfo(row: Row) = DateInfo(
        row["id"] as UUID,
        row["pair_id"] as UUID,
        DateStatus.valueOf(row["status"] as String),
        row["place_id"] as UUID?,
        row["when_scheduled"] as LocalDateTime?,
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
}