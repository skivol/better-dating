package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Query.query
import org.springframework.r2dbc.core.DatabaseClient
import reactor.core.publisher.Mono
import java.util.*

data class LoginInformation(
    val profileId: UUID,
    val lastHost: String,
)

class LoginInformationRepository(
    templateSupplier: Lazy<R2dbcEntityTemplate>,
    clientSupplier: Lazy<DatabaseClient>,
) {
    private val template by templateSupplier
    private val client by clientSupplier

    fun upsertMono(loginInformation: LoginInformation): Mono<Int> =
        client.sql("""
            INSERT INTO login_information(profile_id, last_host) VALUES(:profileId, :lastHost)
            ON CONFLICT (profile_id) DO UPDATE SET last_host = :lastHost
        """.trimIndent())
            .bind("profileId", loginInformation.profileId)
            .bind("lastHost", loginInformation.lastHost)
            .fetch().rowsUpdated()

    suspend fun upsert(loginInformation: LoginInformation): Int = upsertMono(loginInformation).awaitSingle()

    suspend fun find(profileId: UUID): LoginInformation =
        template.select<LoginInformation>()
            .matching(query(where("profile_id").`is`(profileId)))
            .awaitFirst()

    suspend fun delete(currentUserProfileId: UUID) = template.delete<LoginInformation>()
        .matching(query(where("profile_id").`is`(currentUserProfileId)))
        .allAndAwait()
}