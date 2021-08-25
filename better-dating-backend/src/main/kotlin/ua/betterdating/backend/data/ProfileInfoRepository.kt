package ua.betterdating.backend.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.reactive.asFlow
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Query
import org.springframework.data.relational.core.query.Query.query
import org.springframework.data.relational.core.query.Update
import org.springframework.r2dbc.core.DatabaseClient
import java.util.*

class UserAutocomplete(
    val id: UUID,
    val email: String,
    val nickname: String,
)
class ProfileInfoRepository(
    private val template: R2dbcEntityTemplate,
    private val client: DatabaseClient,
) {
    suspend fun save(profileInfo: ProfileInfo): ProfileInfo =
            template.insert<ProfileInfo>().usingAndAwait(profileInfo)

    suspend fun findByProfileId(profileId: UUID) =
            template.select<ProfileInfo>().matching(query(where("profile_id").`is`(profileId))).awaitFirstOrNull()

    suspend fun update(profileInfo: ProfileInfo): Int = template.update<ProfileInfo>()
            .matching(query(where("profile_id").`is`(profileInfo.profileId)))
            .applyAndAwait(Update.update("gender", profileInfo.gender).set("birthday", profileInfo.birthday).set("updated_at", profileInfo.updatedAt))

    suspend fun delete(profileId: UUID) = template.delete<ProfileInfo>().matching(
            query(where("profile_id").`is`(profileId))
    ).allAndAwait()

    fun usersAutocomplete(query: String): Flow<UserAutocomplete> = client.sql("""
        SELECT id, email, nickname
        FROM profile_info pi
        JOIN email e ON e.id = pi.profile_id
        WHERE pi.nickname ~ :query
              OR e.email ~ :query
              OR e.id::text ~ :query
    """.trimIndent())
        .bind("query", query)
        .map { row, _ -> UserAutocomplete(
            row["id"] as UUID,
            row["email"] as String,
            row["nickname"] as String,
        )}
        .all().take(25).asFlow()
}