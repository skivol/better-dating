package ua.betterdating.backend

import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Update.from
import org.springframework.data.relational.core.sql.SqlIdentifier.quoted
import java.util.*

class EmailRepository(private val client: DatabaseClient) {
    suspend fun findByEmail(email: String) = client.execute("SELECT * FROM email WHERE email = :email")
            .bind("email", email).asType<Email>().fetch().awaitOneOrNull()

    suspend fun save(email: Email) = client.insert().into<Email>().table("email").using(email).await()

    suspend fun findById(id: UUID) = client.execute("SELECT * FROM email WHERE id = :id")
            .bind("id", id).asType<Email>().fetch().awaitOne()

    suspend fun update(email: Email) =
            client.update().table("email").using(
                    from(mapOf(
                            quoted("email") to email.email, quoted("verified") to email.verified
                    ))
            ).matching(where("id").`is`(email.id)).fetch().awaitRowsUpdated()
}

class EmailVerificationTokenRepository(private val client: DatabaseClient) {
    suspend fun save(token: EmailVerificationToken) = client.insert().into<EmailVerificationToken>()
            .table("email_verification_token").using(token).await()

    suspend fun findById(id: UUID) =
            client.execute("SELECT * FROM email_verification_token AS evt WHERE evt.id = :id")
                    .bind("id", id).asType<EmailVerificationToken>().fetch().awaitOneOrNull()

    suspend fun delete(token: EmailVerificationToken) =
            client.delete().from("email_verification_token").matching(where("id").`is`(token.id)).fetch().rowsUpdated().awaitFirst()

    suspend fun deleteByProfileIdIfAny(email: Email) =
            client.delete().from("email_verification_token").matching(where("email_id").`is`(email.id)).fetch().rowsUpdated().awaitFirstOrNull()
}

class AcceptedTermsRepository(private val client: DatabaseClient) {
    suspend fun save(acceptedTerms: AcceptedTerms) = client.insert().into<AcceptedTerms>()
            .table("accepted_terms").using(acceptedTerms).await()
}

class ProfileInfoRepository(private val client: DatabaseClient) {
    suspend fun save(profileInfo: ProfileInfo) = client.insert().into<ProfileInfo>()
            .table("profile_info").using(profileInfo).await()

    suspend fun findByProfileId(profileId: UUID) = client.execute(
            "SELECT * FROM profile_info WHERE profile_id = :profileId"
    ).bind("profileId", profileId).asType<ProfileInfo>().fetch().awaitOne()

    suspend fun update(profileInfo: ProfileInfo) =
            client.update().table("profile_info").using(from(mapOf(
                    quoted("gender") to profileInfo.gender, quoted("birthday") to profileInfo.birthday,
                    quoted("updated_at") to profileInfo.updatedAt))
            ).matching(where("profile_id").`is`(profileInfo.profileId)).fetch().awaitRowsUpdated()
}

class HeightRepository(private val client: DatabaseClient) {
    suspend fun save(height: Height) = client.insert().into<Height>()
            .table("height").using(height).await()

    suspend fun findLatestByProfileId(profileId: UUID) = client.execute(
            "SELECT * FROM height WHERE profile_id = :profileId ORDER BY date DESC LIMIT 1"
    ).bind("profileId", profileId).asType<Height>().fetch().awaitOne()
}

class WeightRepository(private val client: DatabaseClient) {
    suspend fun save(weight: Weight) = client.insert().into<Weight>()
            .table("weight").using(weight).await()

    suspend fun findLatestByProfileId(profileId: UUID) = client.execute(
            "SELECT * FROM weight WHERE profile_id = :profileId ORDER BY date DESC LIMIT 1"
    ).bind("profileId", profileId).asType<Weight>().fetch().awaitOne()
}

class ActivityRepository(private val client: DatabaseClient) {
    suspend fun save(activity: Activity) = client.insert().into<Activity>()
            .table("activity").using(activity).await()

    suspend fun findLatestByProfileId(profileId: UUID, activityNames: List<String>) = client.execute(
            "SELECT * FROM activity AS a1 " +
                    "WHERE a1.profile_id = :profileId AND a1.name IN (:activityNames) AND a1.date = (" +
                    "SELECT MAX(a2.date) FROM activity AS a2 WHERE a1.profile_id = a2.profile_id AND a1.name = a2.name" +
                    ") LIMIT :limit"
    ).bind("profileId", profileId).bind("activityNames", activityNames).bind("limit", activityNames.size).asType<Activity>().fetch().all()
}

class ProfileEvaluationRepository(private val client: DatabaseClient) {
    suspend fun save(profileEvaluation: ProfileEvaluation) = client.insert().into<ProfileEvaluation>()
            .table("profile_evaluation").using(profileEvaluation).await()

    suspend fun findLatestHealthEvaluationByProfileId(profileId: UUID) = client.execute(
            "SELECT * FROM profile_evaluation WHERE source_profile_id = :profileId AND target_profile_id = :profileId ORDER BY date DESC LIMIT 1"
    ).bind("profileId", profileId).asType<ProfileEvaluation>().fetch().awaitOne()
}
