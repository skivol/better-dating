package ua.betterdating.backend.data

import com.fasterxml.jackson.databind.ObjectMapper
import io.r2dbc.postgresql.codec.Json
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.reactive.asFlow
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria.empty
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Query
import org.springframework.data.relational.core.query.isIn
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitRowsUpdated
import reactor.core.publisher.Flux
import ua.betterdating.backend.DeleteReason
import ua.betterdating.backend.TooCloseToOtherPlacesException
import java.time.Instant
import java.time.Instant.now
import java.util.*

enum class HistoryType {
    ProfileViewedByOtherUser,
    EmailChanged,
    TooCloseToOtherPlacesExceptionHappened,
    ProfileRemoved,
}
class History(
    @Id val profileId: UUID, // real id is "id", but entity template then fails with java.lang.UnsupportedOperationException: Kotlin class ua.betterdating.backend.data.History has no .copy(…) method for property id!
    val type: HistoryType,
    val payload: Json,
    val id: Int? = null,
    val timestamp: Instant = now(),
)
class HistoryRepository(
    private val template: R2dbcEntityTemplate,
    private val client: DatabaseClient,
    private val mapper: ObjectMapper,
) {
    suspend fun trackEmailChange(id: UUID, email: String): History = template.insert<History>().usingAndAwait(
        historyOf(
            id,
            HistoryType.EmailChanged,
            mapOf("old_email" to email)
        )
    )

    suspend fun trackProfileView(viewerId: UUID, targetId: UUID): History =
        template.insert<History>().usingAndAwait(
            historyOf(
                targetId,
                HistoryType.ProfileViewedByOtherUser,
                mapOf("viewer_profile_id" to viewerId)
            )
        )

    suspend fun deleteRelatedProfileViewsWhereBothUsersAreDeleted(profileId: UUID) =
            client.sql("""DELETE FROM history h WHERE
                    h.type = :type
                    -- deleting view history where current user viewed already removed profile
                    AND (
                        ((h.payload ->> 'viewer_profile_id')::uuid = :profileId AND h.profile_id NOT IN (
                          SELECT id FROM email e
                        ))
                        OR
                        -- or current user was viewed by the user whose profile was already removed
                        (h.profile_id = :profileId AND (h.payload ->> 'viewer_profile_id')::uuid NOT IN (
                          SELECT id FROM email e
                        ))
                    )""".trimIndent())
                    .bind("profileId", profileId)
                .bind("type", HistoryType.ProfileViewedByOtherUser.toString())
                .fetch().awaitRowsUpdated()

    suspend fun trackTooCloseToOtherPlacesException(currentUserId: UUID, e: TooCloseToOtherPlacesException): History =
        template.insert<History>().usingAndAwait(
            historyOf(
                currentUserId,
                HistoryType.TooCloseToOtherPlacesExceptionHappened,
                mapOf("places" to e.points.map { mapOf("id" to it.id, "version" to it.version) })
            )
        )

    suspend fun trackProfileRemovalFeedback(currentUserId: UUID, reason: DeleteReason, explanationComment: String): History =
        template.insert<History>().usingAndAwait(
            historyOf(
                currentUserId,
                HistoryType.TooCloseToOtherPlacesExceptionHappened,
                mapOf("reason" to reason.toString(), "explanation_comment" to explanationComment)
            )
        )


    fun get(profileId: UUID?, types: List<String>): Flow<History> = template.select<History>()
        .matching(Query.query((profileId?.let { where("profile_id").`is`(it) } ?: empty()).and(
            "type"
        ).isIn(types)))
        .all().asFlow()

    private fun historyOf(profileId: UUID, type: HistoryType, payload: Map<String, Any>) = History(
        profileId = profileId,
        type = type,
        payload = Json.of(mapper.writeValueAsString(payload))
    )

    suspend fun relevantNicknames(currentProfileId: UUID): Map<UUID, String> = client.sql("""
        WITH viewer_ids AS (
            SELECT DISTINCT(payload ->> 'viewer_profile_id')::uuid "id"
            FROM history h
            WHERE h.profile_id = :profileId AND h.type = 'ProfileViewedByOtherUser'
        )
        SELECT vi.id "id", nickname
        FROM profile_info pi
        JOIN viewer_ids vi ON vi.id = pi.profile_id
    """.trimIndent())
        .bind("profileId", currentProfileId)
        .map { row, _ -> (row["id"] as UUID) to (row["nickname"] as String) }
        .all().collectList().map { it.toMap() }.awaitSingle()

    suspend fun deleteEmailChangedEvents(currentUserProfileId: UUID) = template.delete<History>()
        .matching(
            Query.query(
                where("profile_id").`is`(currentUserProfileId)
                    .and("type").`is`(HistoryType.EmailChanged.toString())
            )
        ).allAndAwait()
}