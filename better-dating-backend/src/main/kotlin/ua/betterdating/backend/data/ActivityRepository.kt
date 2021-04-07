package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.r2dbc.core.DatabaseClient
import ua.betterdating.backend.Activity
import ua.betterdating.backend.utils.toRecurrence
import java.time.LocalDateTime
import java.util.*

class ActivityRepository(private val template: R2dbcEntityTemplate, private val client: DatabaseClient) {
    suspend fun save(activity: Activity): Activity = template.insert<Activity>().usingAndAwait(activity)

    fun findLatestByProfileId(profileId: UUID, activityNames: List<String>) =
            client.sql(
                    "SELECT * FROM activity AS a1 " +
                            "WHERE a1.profile_id = :profileId AND a1.name IN (:activityNames) AND a1.date = (" +
                                "SELECT MAX(a2.date) FROM activity AS a2 WHERE a1.profile_id = a2.profile_id AND a1.name = a2.name" +
                            ")"
            ).bind("profileId", profileId).bind("activityNames", activityNames).map { row, _ ->
                Activity(
                        row["profile_id"] as UUID,
                        row["name"] as String,
                        row["date"] as LocalDateTime,
                        row["recurrence"].toString().toRecurrence()
                )
            }.all()

    suspend fun delete(profileId: UUID) = template.delete<Activity>().matching(
            Query.query(Criteria.where("profile_id").`is`(profileId))
    ).allAndAwait()
}