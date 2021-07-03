package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.insert
import org.springframework.data.r2dbc.core.usingAndAwait
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitRowsUpdated
import java.util.*

class ProfileViewHistoryRepository(private val template: R2dbcEntityTemplate, private val client: DatabaseClient) {
    suspend fun save(viewHistory: ProfileViewHistory): ProfileViewHistory =
            template.insert<ProfileViewHistory>().usingAndAwait(viewHistory)

    suspend fun delete(profileId: UUID) =
            client.sql("DELETE FROM profile_view_history pvh WHERE " +
                    // deleting view history where current user viewed already removed profile
                    "(pvh.viewer_profile_id = :profileId AND NOT EXISTS (" +
                    "  SELECT id FROM email e WHERE e.id = pvh.target_profile_id" +
                    ")) " +
                    // or current user was viewed by the user whose profile was already removed
                    "OR (pvh.target_profile_id = :profileId AND NOT EXISTS (" +
                    "  SELECT id FROM email e WHERE e.id = pvh.viewer_profile_id" +
                    "))")
                    .bind("profileId", profileId)
                    .fetch().awaitRowsUpdated()
}