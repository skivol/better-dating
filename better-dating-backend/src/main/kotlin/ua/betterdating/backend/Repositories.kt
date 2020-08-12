package ua.betterdating.backend

import io.r2dbc.spi.Row
import io.r2dbc.spi.RowMetadata
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitOneOrNull
import org.springframework.r2dbc.core.awaitRowsUpdated
import reactor.core.publisher.Mono
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

// String extensions
// https://stackoverflow.com/a/60010299
val camelRegex = "(?<=[a-zA-Z])[A-Z]".toRegex()
fun String.camelToSnakeCase(): String {
    return camelRegex.replace(this) {
        "_${it.value}"
    }.toLowerCase()
}

fun String.toTokenType(): TokenType = TokenType.valueOf(this)
fun String.toGender(): Gender = Gender.valueOf(this)
fun String.toRecurrence(): Recurrence = Recurrence.valueOf(this)

suspend fun DatabaseClient.insert(tableName: String, fields: List<Pair<String, Any>>): Int {
    val columns = fields.joinToString(separator = ", ") { it.first.camelToSnakeCase() }
    val values = fields.joinToString(separator = ", ") { ":${it.first}" }
    return fields.fold(
            sql("INSERT INTO $tableName($columns) VALUES($values)"),
            { acc, curr -> acc.bind(curr.first, curr.second) }
    ).fetch().rowsUpdated().awaitSingle()
}

fun assignmentsOf(values: List<Pair<String, Any>>, s: String) = values.joinToString(separator = s) {
    "${it.first.camelToSnakeCase()} = :${it.first}"
}

fun DatabaseClient.updateMono(tableName: String, fields: List<Pair<String, Any>>, where: List<Pair<String, Any>>): Mono<Int> {
    val columns = assignmentsOf(fields, ", ")
    val whereClause = assignmentsOf(where, " AND ")
    return (fields + where).fold(
            sql("UPDATE $tableName SET $columns WHERE $whereClause"),
            { acc, curr -> acc.bind(curr.first, curr.second) }
    ).fetch().rowsUpdated()
}

suspend fun DatabaseClient.update(tableName: String, fields: List<Pair<String, Any>>, where: List<Pair<String, Any>>): Int = updateMono(tableName, fields, where).awaitSingle()

suspend fun DatabaseClient.delete(tableName: String, where: List<Pair<String, Any>>): Int {
    val whereClause = assignmentsOf(where, " AND ")
    return where.fold(
            sql("DELETE FROM $tableName WHERE $whereClause"),
            { acc, curr -> acc.bind(curr.first, curr.second) }
    ).fetch().awaitRowsUpdated()
}

// TODO use spring-data again when available
val emailMapper: (Row, RowMetadata) -> Email = { row, _ -> Email(row["email"] as String, row["verified"] as Boolean, row["id"] as UUID) }

class EmailRepository(clientSupplier: Lazy<DatabaseClient>) {
    private val client by clientSupplier
    private val selectFromEmail = "SELECT * FROM email"

    fun findByEmailMono(email: String) = client.sql("$selectFromEmail WHERE email = :email")
            .bind("email", email).map(emailMapper).one()

    suspend fun findByEmail(email: String) = findByEmailMono(email).awaitFirstOrNull()

    suspend fun save(email: Email) = client.insert("email", listOf(
            "id" to email.id, "email" to email.email, "verified" to email.verified
    ))

    suspend fun findById(id: UUID): Email? = client.sql("$selectFromEmail WHERE id = :id")
            .bind("id", id)
            .map(emailMapper)
            .awaitOneOrNull()

    fun updateMono(email: Email) = client.updateMono(
            "email", listOf("email" to email.email, "verified" to email.verified), listOf("id" to email.id)
    )

    suspend fun update(email: Email) = updateMono(email).awaitFirstOrNull()
}

class ExpiringTokenRepository(private val client: DatabaseClient) {
    suspend fun save(token: ExpiringToken) =
            client.insert("expiring_token", listOf(
                    "profileId" to token.profileId, "type" to token.type.toString(),
                    "encodedValue" to token.encodedValue, "expires" to token.expires
            ))

    suspend fun findByProfileIdAndType(profileId: UUID, type: TokenType) =
            client.sql("""SELECT type, profile_id, expires, encoded_value
                          FROM expiring_token AS et
                          WHERE et.profile_id = :profileId AND et.type = :type""".trimIndent())
                    .bind("profileId", profileId).bind("type", type.toString())
                    .map { row, _ ->
                        ExpiringToken(
                                row["profile_id"] as UUID,
                                row["expires"] as LocalDateTime,
                                row["type"].toString().toTokenType(),
                                row["encoded_value"] as String
                        )
                    }.awaitOneOrNull()

    suspend fun delete(token: ExpiringToken) = deleteByProfileIdAndTypeIfAny(token.profileId, token.type)

    suspend fun deleteByProfileIdAndTypeIfAny(profileId: UUID, type: TokenType) =
            client.delete("expiring_token", listOf("profileId" to profileId, "type" to type.toString()))
}

class AcceptedTermsRepository(private val client: DatabaseClient) {
    suspend fun save(acceptedTerms: AcceptedTerms) = client.insert("accepted_terms", listOf(
            "profileId" to acceptedTerms.profileId,
            "lastDateAccepted" to acceptedTerms.lastDateAccepted
    ))
}

class ProfileInfoRepository(private val client: DatabaseClient) {
    suspend fun save(profileInfo: ProfileInfo) = client.insert("profile_info", listOf(
            "profileId" to profileInfo.profileId,
            "birthday" to profileInfo.birthday,
            "gender" to profileInfo.gender.toString(),
            "createdAt" to profileInfo.createdAt!!
    ) + (profileInfo.updatedAt?.let { listOf("updated_at" to it) } ?: emptyList()))

    suspend fun findByProfileId(profileId: UUID) = client.sql(
            "SELECT profile_id, gender, birthday, created_at, updated_at FROM profile_info WHERE profile_id = :profileId"
    ).bind("profileId", profileId).map { row, _ ->
        ProfileInfo(
                row["profile_id"] as UUID,
                row["gender"].toString().toGender(),
                row["birthday"] as LocalDate,
                row["created_at"] as LocalDateTime,
                row["updated_at"] as LocalDateTime?
        )
    }.awaitOneOrNull()

    suspend fun update(profileInfo: ProfileInfo) =
            client.update("profile_info", listOf(
                    "gender" to profileInfo.gender.toString(), "birthday" to profileInfo.birthday,
                    "updated_at" to profileInfo.updatedAt!!
            ), listOf("profile_id" to profileInfo.profileId))
}

class HeightRepository(private val client: DatabaseClient) {
    suspend fun save(height: Height) = client.insert("height", listOf(
            "profileId" to height.profileId, "date" to height.date, "height" to height.height
    ))

    suspend fun findLatestByProfileId(profileId: UUID) = client.sql(
            "SELECT profile_id, date, height FROM height WHERE profile_id = :profileId ORDER BY date DESC LIMIT 1"
    ).bind("profileId", profileId).map { row, _ ->
        Height(
                row["profile_id"] as UUID,
                row["date"] as LocalDateTime,
                (row["height"] as BigDecimal).toFloat()
        )
    }.awaitOneOrNull()
}

class WeightRepository(private val client: DatabaseClient) {
    suspend fun save(weight: Weight) = client.insert("weight", listOf(
            "profileId" to weight.profileId, "date" to weight.date, "weight" to weight.weight
    ))

    suspend fun findLatestByProfileId(profileId: UUID) = client.sql(
            "SELECT profile_id, date, weight FROM weight WHERE profile_id = :profileId ORDER BY date DESC LIMIT 1"
    ).bind("profileId", profileId).map { row, _ ->
        Weight(
                row["profile_id"] as UUID,
                row["date"] as LocalDateTime,
                (row["weight"] as BigDecimal).toFloat()
        )
    }.awaitOneOrNull()
}

class ActivityRepository(private val client: DatabaseClient) {
    suspend fun save(activity: Activity) = client.insert("activity", listOf(
            "profileId" to activity.profileId,
            "date" to activity.date,
            "name" to activity.name,
            "recurrence" to activity.recurrence.toString()
    ))

    fun findLatestByProfileId(profileId: UUID, activityNames: List<String>) = client.sql(
            "SELECT profile_id, name, date, recurrence FROM activity AS a1 " +
                    "WHERE a1.profile_id = :profileId AND a1.name IN (:activityNames) AND a1.date = (" +
                    "SELECT MAX(a2.date) FROM activity AS a2 WHERE a1.profile_id = a2.profile_id AND a1.name = a2.name" +
                    ") LIMIT :limit"
    ).bind("profileId", profileId)
            .bind("activityNames", activityNames)
            .bind("limit", activityNames.size)
            .map { row, _ ->
                Activity(
                        row["profile_id"] as UUID,
                        row["name"] as String,
                        row["date"] as LocalDateTime,
                        row["recurrence"].toString().toRecurrence()
                )
            }.all()
}

class ProfileEvaluationRepository(private val client: DatabaseClient) {
    suspend fun save(profileEvaluation: ProfileEvaluation) = client.insert("profile_evaluation", listOf(
            "sourceProfileId" to profileEvaluation.sourceProfileId,
            "targetProfileId" to profileEvaluation.targetProfileId,
            "date" to profileEvaluation.date,
            "evaluation" to profileEvaluation.evaluation
    ) + (profileEvaluation.comment?.let { listOf("comment" to it) } ?: emptyList()))

    suspend fun findLatestHealthEvaluationByProfileId(profileId: UUID) = client.sql(
            "SELECT source_profile_id, target_profile_id, date, evaluation, comment " +
                    "FROM profile_evaluation " +
                    "WHERE source_profile_id = :profileId AND target_profile_id = :profileId  " +
                    "ORDER BY date DESC LIMIT 1"
    ).bind("profileId", profileId).map { row, _ ->
        ProfileEvaluation(
                row["source_profile_id"] as UUID,
                row["target_profile_id"] as UUID,
                row["date"] as LocalDateTime,
                (row["evaluation"] as BigDecimal).toInt(),
                row["comment"] as String?
        )
    }.awaitOneOrNull()
}
