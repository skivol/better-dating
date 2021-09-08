package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.insert
import org.springframework.data.r2dbc.core.update
import org.springframework.data.r2dbc.core.usingAndAwait
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.data.relational.core.query.Update
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitOneOrNull
import java.time.OffsetDateTime
import java.util.*

data class DateVerificationTokenData(
    @Id val tokenId: UUID,
    val dateId: UUID,
    val verificationAttempts: Int,
)
class DateVerificationTokenDataRepository(
    private val template: R2dbcEntityTemplate,
    private val client: DatabaseClient,
) {
    suspend fun save(dateVerificationTokenData: DateVerificationTokenData): DateVerificationTokenData =
        template.insert<DateVerificationTokenData>().usingAndAwait(dateVerificationTokenData)
    suspend fun update(dateVerificationTokenData: DateVerificationTokenData): Int =
        template.update<DateVerificationTokenData>()
            .matching(Query.query(
                Criteria.where("token_id").`is`(dateVerificationTokenData.tokenId).and("date_id").`is`(dateVerificationTokenData.dateId)
            )).apply(Update.update("verification_attempts", dateVerificationTokenData.verificationAttempts))
            .awaitSingle()

    suspend fun findToken(dateId: UUID): Pair<DateVerificationTokenData, ExpiringToken>? =
        client.sql("""
            SELECT et.*, dvtd.* FROM expiring_token et
            JOIN date_verification_token_data dvtd ON et.id = dvtd.token_id
            WHERE dvtd.date_id = :dateId
        """.trimIndent())
            .bind("dateId", dateId)
            .map { row, _ ->
                Pair(DateVerificationTokenData(
                    row["token_id"] as UUID,
                    row["date_id"] as UUID,
                    row["verification_attempts"] as Int
                ), ExpiringToken(
                    row["id"] as UUID,
                    row["profile_id"] as UUID,
                    TokenType.valueOf(row["type"] as String),
                    (row["expires"] as OffsetDateTime).toInstant(),
                    row["encoded_value"] as String
                ))
            }
            .awaitOneOrNull()
}