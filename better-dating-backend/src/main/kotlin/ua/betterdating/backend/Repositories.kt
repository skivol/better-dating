package ua.betterdating.backend

import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.domain.Sort.Direction.DESC
import org.springframework.data.domain.Sort.by
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Query.query
import org.springframework.data.relational.core.query.Update.update
import org.springframework.r2dbc.core.DatabaseClient
import java.time.LocalDateTime
import java.util.*

// String extensions
fun String.toRecurrence(): Recurrence = Recurrence.valueOf(this)

class EmailRepository(templateSupplier: Lazy<R2dbcEntityTemplate>) {
    private val template by templateSupplier

    fun findByEmailMono(email: String) = template.select<Email>()
            .matching(query(where("email").`is`(email))).one()

    suspend fun findByEmail(email: String) = findByEmailMono(email).awaitFirstOrNull()

    suspend fun save(email: Email): Email = template.insert<Email>().usingAndAwait(email)

    suspend fun findById(id: UUID): Email? = template.select<Email>()
            .matching(query(where("id").`is`(id))).one()
            .awaitFirstOrNull()

    fun updateMono(email: Email) = template.update<Email>()
            .matching(query(where("id").`is`(email.id)))
            .apply(update("email", email.email).set("verified", email.verified))

    suspend fun update(email: Email): Int = updateMono(email).awaitSingle()

    suspend fun delete(profileId: UUID) = template.delete<Email>().matching(
            query(where("id").`is`(profileId))
    ).allAndAwait()
}

class ExpiringTokenRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(token: ExpiringToken): ExpiringToken =
            template.insert<ExpiringToken>().usingAndAwait(token)

    suspend fun findByProfileIdAndType(profileId: UUID, type: TokenType): ExpiringToken? =
            template.select<ExpiringToken>()
                    .matching(query(
                            where("profile_id").`is`(profileId).and("type").`is`(type)
                    )).awaitOneOrNull()

    suspend fun delete(token: ExpiringToken) = deleteByProfileIdAndTypeIfAny(token.profileId, token.type)

    suspend fun deleteByProfileIdAndTypeIfAny(profileId: UUID, type: TokenType) =
            template.delete<ExpiringToken>()
                    .matching(query(
                            where("profile_id").`is`(profileId).and("type").`is`(type)
                    )).allAndAwait()

    suspend fun deleteByProfileId(profileId: UUID) =
            template.delete<ExpiringToken>().matching(query(where("profile_id").`is`(profileId))).allAndAwait()
}

class AcceptedTermsRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(acceptedTerms: AcceptedTerms): AcceptedTerms =
            template.insert<AcceptedTerms>().usingAndAwait(acceptedTerms)

    suspend fun delete(profileId: UUID) = template.delete<AcceptedTerms>().matching(
            query(where("profile_id").`is`(profileId))
    ).allAndAwait()
}

class ProfileInfoRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(profileInfo: ProfileInfo): ProfileInfo =
            template.insert<ProfileInfo>().usingAndAwait(profileInfo)

    suspend fun findByProfileId(profileId: UUID) =
            template.select<ProfileInfo>().matching(query(where("profile_id").`is`(profileId))).awaitFirstOrNull()

    suspend fun update(profileInfo: ProfileInfo): Int = template.update<ProfileInfo>()
            .matching(query(where("profile_id").`is`(profileInfo.profileId)))
            .applyAndAwait(update("gender", profileInfo.gender).set("birthday", profileInfo.birthday).set("updated_at", profileInfo.updatedAt))

    suspend fun delete(profileId: UUID) = template.delete<ProfileInfo>().matching(
            query(where("profile_id").`is`(profileId))
    ).allAndAwait()
}

class HeightRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(height: Height): Height = template.insert<Height>().usingAndAwait(height)

    suspend fun findLatestByProfileId(profileId: UUID): Height =
            template.select<Height>().matching(query(
                    where("profile_id").`is`(profileId)
            ).limit(1).sort(by(DESC, "date"))).awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<Height>().matching(
            query(where("profile_id").`is`(profileId))
    ).allAndAwait()
}

class WeightRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(weight: Weight): Weight = template.insert<Weight>().usingAndAwait(weight)

    suspend fun findLatestByProfileId(profileId: UUID): Weight =
            template.select<Weight>().matching(query(
                    where("profile_id").`is`(profileId)
            ).sort(by(DESC, "date")).limit(1)).awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<Weight>().matching(
            query(where("profile_id").`is`(profileId))
    ).allAndAwait()
}

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
            query(where("profile_id").`is`(profileId))
    ).allAndAwait()
}

class ProfileEvaluationRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(profileEvaluation: ProfileEvaluation): ProfileEvaluation = template.insert<ProfileEvaluation>().usingAndAwait(profileEvaluation)

    suspend fun findLatestHealthEvaluationByProfileId(profileId: UUID): ProfileEvaluation =
            template.select<ProfileEvaluation>().matching(query(
                    where("source_profile_id").`is`(profileId).and("target_profile_id").`is`(profileId)
            ).sort(by(DESC, "date")).limit(1)).awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<ProfileEvaluation>().matching(
            query(where("source_profile_id").`is`(profileId).and("target_profile_id").`is`(profileId))
    ).allAndAwait()
}

class EmailChangeHistoryRepository(private val template: R2dbcEntityTemplate) {
    suspend fun delete(profileId: UUID) = template.delete<EmailChangeHistory>().matching(
            query(where("profile_id").`is`(profileId))
    ).allAndAwait()
}

class ProfileDeletionFeedbackRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(feedback: ProfileDeletionFeedback): ProfileDeletionFeedback = template.insert<ProfileDeletionFeedback>().usingAndAwait(feedback)
}
