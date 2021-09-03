package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Query.query
import org.springframework.r2dbc.core.DatabaseClient
import java.util.*

data class LoginInformation(
    val profileId: UUID,
    val lastHost: String,
)

class LoginInformationRepository(
    private val template: R2dbcEntityTemplate,
    private val client: DatabaseClient,
) {
    suspend fun upsert(loginInformation: LoginInformation): Int =
        client.sql("""
            INSERT INTO login_information(profile_id, last_host) VALUES(:profileId, :lastHost)
            ON CONFLICT (profile_id) DO UPDATE SET last_host = :lastHost
        """.trimIndent())
            .bind("profileId", loginInformation.profileId)
            .bind("lastHost", loginInformation.lastHost)
            .fetch().rowsUpdated().awaitSingle()

    suspend fun find(profileId: UUID): LoginInformation =
        template.select<LoginInformation>()
            .matching(query(where("profile_id").`is`(profileId)))
            .awaitFirst()

    suspend fun delete(currentUserProfileId: UUID) = template.delete<LoginInformation>()
        .matching(query(where("profile_id").`is`(currentUserProfileId)))
        .allAndAwait()
}