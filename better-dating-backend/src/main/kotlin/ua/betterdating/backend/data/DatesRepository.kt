package ua.betterdating.backend.data

import io.r2dbc.spi.Row
import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.annotation.Id
import org.springframework.r2dbc.core.*
import ua.betterdating.backend.tasks.toUtc
import java.time.*
import java.time.format.DateTimeFormatter
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
    WaitingForPlace, WaitingForPlaceApproval, Scheduled, PartialCheckIn, FullCheckIn, Verified, Cancelled, Rescheduled
}

data class DateInfo(
    @Id val id: UUID = UUID.randomUUID(),
    val pairId: UUID,
    val status: DateStatus,
    val placeId: UUID? = null,
    val placeVersion: Int? = null,
    val whenScheduled: ZonedDateTime? = null,
    val cancelledBy: UUID? = null,
    val rescheduledBy: Array<UUID>? = null,
)

data class FullDateInfo(
    val dateInfo: DateInfo,
    val place: Place?,
    val unsettledPlaces: List<Place>,
    val credibility: ProfileCredibility?,
    val improvement: ProfileImprovement?,
    val otherCredibility: ProfileCredibility?,
    val otherImprovement: ProfileImprovement?,
)

const val nearPlaces = """
    near_places AS (
        SELECT p.* FROM place p
        JOIN (
            SELECT id, max(version) "version" FROM place
            WHERE populated_locality_id = :populatedLocalityId
                AND status = 'Approved'
            GROUP BY id
        ) AS latest_approved_version ON latest_approved_version.id = p.id AND latest_approved_version.version = p.version
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
        JOIN place p ON p.id = d.place_id AND p.version = d.place_version
        WHERE d.status = 'Scheduled' AND p.populated_locality_id = :populatedLocalityId
    """.trimIndent())
        .bind("populatedLocalityId", populatedLocalityId)
        .map { row, _ -> extractDateInfo(row)}
        .all().collectList().awaitFirst()

    suspend fun upsert(dateInfo: DateInfo): Int = client.sql(
        """
            INSERT INTO dates(id, pair_id, status, place_id, place_version, when_scheduled, cancelled_by, rescheduled_by)
            VALUES(:id, :pairId, :status, :placeId, :placeVersion, :whenScheduled, :cancelledBy, :rescheduledBy)
            ON CONFLICT (id) DO UPDATE SET
                pair_id = EXCLUDED.pair_id, status = EXCLUDED.status,
                place_id = EXCLUDED.place_id, place_version = EXCLUDED.place_version,
                when_scheduled = EXCLUDED.when_scheduled, cancelled_by = EXCLUDED.cancelled_by,
                rescheduled_by = EXCLUDED.rescheduled_by
        """.trimIndent()
    ).bind("id", dateInfo.id)
        .bind("pairId", dateInfo.pairId)
        .bind("status", dateInfo.status.toString())
        .bind("placeId", dateInfo.placeId)
        .bind("placeVersion", dateInfo.placeVersion)
        .bind("whenScheduled", dateInfo.whenScheduled)
        .bind("cancelledBy", dateInfo.cancelledBy)
        .bind("rescheduledBy", dateInfo.rescheduledBy)
        .fetch().awaitRowsUpdated()

    suspend fun findRelevantDates(profileId: UUID): List<FullDateInfo> = client.sql("""
        WITH unsettled_places AS (
                SELECT id "up_id", array_agg(name) "up_names",
                    array_agg(ST_x(location::geometry)::text) "up_longitudes",
                    array_agg(ST_y(location::geometry)::text) "up_latitudes",
                    array_agg(populated_locality_id) "up_populated_locality_ids",
                    array_agg(suggested_by) "up_suggested_by",
                    array_agg(status) "up_statuses",
                    array_agg(approved_by) "up_approved_by",
                    array_agg(version) "up_versions",
                    array_agg(to_char(created_at, 'YYYY-MM-DD"T"HH24:MM:SS.USOF')) "up_created_at"
                FROM place
                WHERE status = 'WaitingForApproval'
                GROUP BY id
        ) SELECT d.*,
            p.id "place_id", p.version "place_version",
            p.name "place_name", ST_x(p.location::geometry) "place_longitude", ST_y(p.location::geometry) "place_latitude",
            p.populated_locality_id "place_populated_locality_id", p.suggested_by "place_suggested_by",
            p.status "place_status", p.approved_by "place_approved_by", p.created_at "place_created_at",
            up.*,
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
        LEFT JOIN place p ON p.id = d.place_id AND p.version = d.place_version
        LEFT JOIN unsettled_places up ON up.up_id = d.place_id
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
        SELECT d.* FROM dates d
        WHERE d.pair_id = :pairId AND d.status = 'Verified'
    """.trimIndent())
        .bind("pairId", pairId)
        .map { row, _ -> extractDateInfo(row)}
        .all().collectList().awaitFirst()

    private fun extractDateInfoWithPlace(row: Row) = FullDateInfo(
        extractDateInfo(row),
        if (row["place_version"] != null) extractPlace(row, "place_") else null,
        extractUnsettledPlaces(row),
        if (row["credibility_date_id"] != null) extractProfileCredibility(row, "credibility_") else null,
        if (row["improvement_date_id"] != null) extractProfileImprovement(row, "improvement_") else null,
        if (row["other_credibility_date_id"] != null) extractProfileCredibility(row, "other_credibility_") else null,
        if (row["other_improvement_date_id"] != null) extractProfileImprovement(row, "other_improvement_") else null,
    )

    @Suppress("UNCHECKED_CAST")
    private fun extractUnsettledPlaces(row: Row): List<Place> = if (row["up_id"] != null)
        (row["up_names"] as Array<String>).mapIndexed { i, name ->
            Place(
                row["up_id"] as UUID,
                name,
                (row["up_longitudes"] as Array<String>)[i].toDouble(), // workaround "Cannot decode value of type java.lang.Object" if trying to use Array<Double/OffsetDateTime>
                (row["up_latitudes"] as Array<String>)[i].toDouble(), // try fixing in the "r2dbc-postgresql" framework ? (https://www.stackbuilders.com/tutorials/java/webflux-contribution/)
                (row["up_populated_locality_ids"] as Array<UUID>)[i],
                (row["up_suggested_by"] as Array<UUID>)[i],
                PlaceStatus.valueOf((row["up_statuses"] as Array<String>)[i]),
                (row["up_versions"] as Array<Int>)[i],
                (row["up_approved_by"] as Array<UUID>)[i],
                OffsetDateTime.parse((row["up_created_at"] as Array<String>)[i]).toInstant(),
            )
        }.toList()
    else emptyList()

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
        row["place_version"] as Int?,
        (row["when_scheduled"] as OffsetDateTime?)?.toZonedDateTime()?.toUtc(),
        row["cancelled_by"] as UUID?,
        row["rescheduled_by"] as Array<UUID>?,
    )

    suspend fun findById(dateId: UUID) = client.sql("""
        SELECT d.* FROM dates d WHERE d.id = :dateId
    """.trimIndent())
        .bind("dateId", dateId)
        .map { row, _ -> extractDateInfo(row)}
        .awaitSingleOrNull()

    suspend fun distanceToDateLocation(dateId: UUID, latitude: Double, longitude: Double): Double = client.sql("""
        SELECT ST_Distance(p.location, ST_MakePoint(:longitude, :latitude)) "distance"
        FROM dates d
        JOIN place p ON p.id = d.place_id AND p.version = d.place_version
        WHERE d.id = :dateId
    """.trimIndent())
        .bind("dateId", dateId)
        .bind("latitude", latitude)
        .bind("longitude", longitude)
        .map { row, _ -> row["distance"] as Double}
        .awaitSingle()

}