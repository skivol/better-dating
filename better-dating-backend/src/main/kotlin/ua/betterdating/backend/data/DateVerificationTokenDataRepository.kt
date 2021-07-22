package ua.betterdating.backend.data

import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.insert
import org.springframework.data.r2dbc.core.select
import org.springframework.data.r2dbc.core.usingAndAwait
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitOneOrNull
import java.time.LocalDateTime
import java.util.*

class DateVerificationTokenData(
    @Id val tokenId: UUID,
    val dateId: UUID,
)
class DateVerificationTokenDataRepository(
    private val template: R2dbcEntityTemplate,
    private val client: DatabaseClient,
) {
    suspend fun save(dateVerificationTokenData: DateVerificationTokenData): DateVerificationTokenData =
        template.insert<DateVerificationTokenData>().usingAndAwait(dateVerificationTokenData)

    suspend fun findToken(dateId: UUID): ExpiringToken? =
        client.sql("""
            SELECT et.* FROM expiring_token et
            JOIN date_verification_token_data dvtd ON et.id = dvtd.token_id
            WHERE dvtd.date_id = :dateId
        """.trimIndent())
            .bind("dateId", dateId)
            .map { row, _ ->
                ExpiringToken(
                    row["id"] as UUID,
                    row["profile_id"] as UUID,
                    TokenType.valueOf(row["type"] as String),
                    row["expires"] as LocalDateTime,
                    row["encoded_value"] as String
                )
            }
            .awaitOneOrNull()
}