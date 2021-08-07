package ua.betterdating.backend.data

import io.r2dbc.spi.Row
import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.annotation.Id
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
    WaitingForPlace, PlaceSuggested, Scheduled, PartialCheckIn, FullCheckIn, Verified
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

class FullDateInfo(
    val dateInfo: DateInfo,
    val place: Place?,
    val credibility: ProfileCredibility?,
    val improvement: ProfileImprovement?,
    val otherCredibility: ProfileCredibility?,
    val otherImprovement: ProfileImprovement?,
)

const val nearPlaces = """
    near_places AS (
        SELECT * FROM place
        WHERE populated_locality_id = :populatedLocalityId
        AND status = 'Approved'
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
        WHERE d.status = 'Scheduled' AND p.populated_locality_id = :populatedLocalityId
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
        UPDATE dates SET place_id = :placeId, status = 'PlaceSuggested' WHERE id = :dateId
    """.trimIndent())
        .bind("dateId", dateId)
        .bind("placeId", placeId)
        .fetch().awaitRowsUpdated()

    suspend fun findRelevantDates(profileId: UUID): List<FullDateInfo> = client.sql("""
        SELECT d.*, ST_x(d.location::geometry) "longitude", ST_y(d.location::geometry) "latitude",
            p.name "place_name", ST_x(p.location::geometry) "place_longitude", ST_y(p.location::geometry) "place_latitude",
            p.populated_locality_id "place_populated_locality_id", p.suggested_by "place_suggested_by",
            p.status "place_status",
            pc.date_id "credibility_date_id", pc.source_profile_id "credibility_source_profile_id", pc.target_profile_id "credibility_target_profile_id",
            pc.category "credibility_category", pc.comment "credibility_comment", pc.created_at "credibility_created_at",
            pi.date_id "improvement_date_id", pi.source_profile_id "improvement_source_profile_id", pi.target_profile_id "improvement_target_profile_id",
            pi.category "improvement_category", pi.comment "improvement_comment", pi.created_at "improvement_created_at",
            pc_other.date_id "other_credibility_date_id", pc_other.source_profile_id "other_credibility_source_profile_id", pc_other.target_profile_id "other_credibility_target_profile_id",
            pc_other.category "other_credibility_category", pc_other.comment "other_credibility_comment", pc_other.created_at "other_credibility_created_at",
            pi_other.date_id "other_improvement_date_id", pi_other.source_profile_id "other_improvement_source_profile_id", pi_other.target_profile_id "other_improvement_target_profile_id",
            pi_other.category "other_improvement_category", pi_other.comment "other_improvement_comment", pi_other.created_at "other_improvement_created_at"
        FROM dates d
        JOIN dating_pair dp ON dp.id = d.pair_id
        LEFT JOIN place p ON p.id = d.place_id
        LEFT JOIN profile_credibility pc ON pc.date_id = d.id AND pc.target_profile_id = :profileId
        LEFT JOIN profile_improvement pi ON pi.date_id = d.id AND pi.target_profile_id = :profileId
        LEFT JOIN profile_credibility pc_other ON pc_other.date_id = d.id AND pc_other.source_profile_id = :profileId
        LEFT JOIN profile_improvement pi_other ON pi_other.date_id = d.id AND pi_other.source_profile_id = :profileId
        WHERE dp.first_profile_id = :profileId OR dp.second_profile_id = :profileId
    """.trimIndent())
        .bind("profileId", profileId)
        .map { row, _ -> extractDateInfoWithPlace(row)}
        .all().collectList().awaitFirst()

    suspend fun findVerifiedByPairId(pairId: UUID): List<DateInfo> = client.sql("""
        SELECT d.*, ST_x(d.location::geometry) "longitude", ST_y(d.location::geometry) "latitude"
         FROM dates d
        WHERE d.pair_id = :pairId AND d.status = 'Verified'
    """.trimIndent())
        .bind("pairId", pairId)
        .map { row, _ -> extractDateInfo(row)}
        .all().collectList().awaitFirst()

    private fun extractDateInfoWithPlace(row: Row) = FullDateInfo(
        extractDateInfo(row),
        if (row["place_id"] != null) extractPlace(row, "place_") else null,
        if (row["credibility_date_id"] != null) extractProfileCredibility(row, "credibility_") else null,
        if (row["improvement_date_id"] != null) extractProfileImprovement(row, "improvement_") else null,
        if (row["other_credibility_date_id"] != null) extractProfileCredibility(row, "other_credibility_") else null,
        if (row["other_improvement_date_id"] != null) extractProfileImprovement(row, "other_improvement_") else null,
    )

    private fun extractProfileCredibility(row: Row, prefix: String) = ProfileCredibility(
        row["${prefix}date_id"] as UUID,
        row["${prefix}source_profile_id"] as UUID,
        row["${prefix}target_profile_id"] as UUID,
        CredibilityCategory.valueOf(row["${prefix}category"] as String),
        row["${prefix}comment"] as String?,
        (row["${prefix}created_at"] as OffsetDateTime).toInstant(),
    )

    private fun extractProfileImprovement(row: Row, prefix: String) = ProfileImprovement(
        row["${prefix}date_id"] as UUID,
        row["${prefix}source_profile_id"] as UUID,
        row["${prefix}target_profile_id"] as UUID,
        ImprovementCategory.valueOf(row["${prefix}category"] as String),
        row["${prefix}comment"] as String?,
        (row["${prefix}created_at"] as OffsetDateTime).toInstant(),
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