package ua.betterdating.backend.data

import io.r2dbc.spi.Row
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.reactive.asFlow
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.insert
import org.springframework.data.r2dbc.core.usingAndAwait
import org.springframework.r2dbc.core.DatabaseClient
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.util.*

data class WhenAndWhere(
    val timeAndDate: LocalDateTime,
    val placeId: UUID,
)

enum class DateStatus {
    waitingForPlace
}

class DateInfo(
    @Id val id: UUID = UUID.randomUUID(),
    val pairId: UUID,
    val status: DateStatus,
    val placeId: UUID?,
    val whenScheduled: LocalDateTime?,
)

class DatesRepository(
    private val client: DatabaseClient,
    private val template: R2dbcEntityTemplate,
) {
    fun findAvailableDatingSpotsIn(populatedLocalityId: UUID) =
        client.sql("""
            WITH near_places AS (
                SELECT * FROM place
                WHERE populated_locality_id = :populatedLocalityId
            ), next_timeslots AS (
                SELECT
                    date_trunc('day', now()) + interval '1 day' * ((
                        CASE WHEN (extract(isodow from now()) >= day_of_week)
                        THEN day_of_week + 7
                        ELSE day_of_week END
                    ) - extract(isodow from now())) + "time" "scheduled_time",
                    near_places.id "scheduled_place_id", near_places."name" "scheduled_place_name"
                FROM timeslot, near_places ORDER BY "scheduled_time"
            )
            SELECT nt.* FROM next_timeslots nt
            LEFT JOIN dates d ON d.when_scheduled = scheduled_time AND d.place_id = scheduled_place_id
            WHERE d.id IS NULL
            """.trimIndent()
        ).bind("populatedLocalityId", populatedLocalityId)
            .map { row, _ -> extractWhenAndWhere(row)}
            .all().asFlow()

    suspend fun save(dateInfo: DateInfo): DateInfo = template.insert<DateInfo>().into("dates").usingAndAwait(dateInfo)

    private fun extractWhenAndWhere(row: Row) = WhenAndWhere(
        (row["scheduled_time"] as OffsetDateTime).toLocalDateTime(), row["scheduled_place_id"] as UUID
    )
}