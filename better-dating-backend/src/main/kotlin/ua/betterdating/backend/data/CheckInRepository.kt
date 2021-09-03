package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Query
import java.time.ZonedDateTime
import java.util.*

class DateCheckIn(
    @Id val dateId: UUID, // key is actually composite, specified here to silence "Required identifier property not found for class" error
    val profileId: UUID,
    val whenCheckedIn: ZonedDateTime,
)

class CheckInRepository(
    private val template: R2dbcEntityTemplate,
) {
    suspend fun save(dateId: UUID, profileId: UUID, whenCheckedIn: ZonedDateTime): DateCheckIn =
        template.insert<DateCheckIn>().usingAndAwait(DateCheckIn(dateId, profileId, whenCheckedIn))

    suspend fun fetch(dateId: UUID): List<DateCheckIn> = template.select<DateCheckIn>()
        .matching(Query.query(where("date_id").`is`(dateId)))
        .all().collectList()
        .awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<DateCheckIn>()
        .matching(Query.query(where("profile_id").`is`(profileId)))
        .allAndAwait()
}