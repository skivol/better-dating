package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitOneOrNull
import org.springframework.r2dbc.core.awaitRowsUpdated
import java.util.*

class ExpiringTokenRepository(private val template: R2dbcEntityTemplate, private val client: DatabaseClient) {
    suspend fun save(token: ExpiringToken): ExpiringToken =
            template.insert<ExpiringToken>().usingAndAwait(token)

    suspend fun findEmailByTokenId(id: UUID): Email? = client.sql(
            "SELECT e.id, email, verified FROM email e JOIN expiring_token et ON e.id = et.profile_id WHERE et.id = :tokenId"
    ).bind("tokenId", id).map { row, _ ->
        Email(email = row["email"] as String, verified = row["verified"] as Boolean, id = row["id"] as UUID)
    }.awaitOneOrNull()

    suspend fun delete(token: ExpiringToken) = deleteByProfileIdAndTypeIfAny(token.profileId, token.type)

    suspend fun deleteByProfileIdAndTypeIfAny(profileId: UUID, type: TokenType) =
            template.delete<ExpiringToken>()
                    .matching(Query.query(
                            Criteria.where("profile_id").`is`(profileId).and("type").`is`(type)
                    )).allAndAwait()

    suspend fun deleteByProfileId(profileId: UUID) =
            template.delete<ExpiringToken>().matching(Query.query(Criteria.where("profile_id").`is`(profileId))).allAndAwait()

    suspend fun findById(id: UUID): ExpiringToken? =
            template.select<ExpiringToken>().matching(Query.query(Criteria.where("id").`is`(id))).awaitOneOrNull()

    suspend fun deleteByDateIds(dateIds: List<UUID>): Int = client.sql("""
        DELETE FROM expiring_token et
        WHERE et.id IN (
            SELECT token_id
            FROM date_verification_token_data dvtd
            WHERE dvtd.date_id IN (:dateIds)
        )
    """.trimIndent())
        .bind("dateIds", dateIds)
        .fetch().awaitRowsUpdated()
}