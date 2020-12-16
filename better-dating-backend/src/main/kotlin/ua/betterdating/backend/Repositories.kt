package ua.betterdating.backend

import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.domain.Sort.Direction.DESC
import org.springframework.data.domain.Sort.by
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria.empty
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Query
import org.springframework.data.relational.core.query.Query.query
import org.springframework.data.relational.core.query.Update.update
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitOneOrNull
import org.springframework.r2dbc.core.awaitRowsUpdated
import reactor.core.publisher.Flux
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

class UserRoleRepository(templateSupplier: Lazy<R2dbcEntityTemplate>) {
    private val template by templateSupplier

    suspend fun save(userRole: UserRole): UserRole = template.insert<UserRole>().usingAndAwait(userRole)

    suspend fun findAll(profileId: UUID): List<UserRole> = findAllMono(profileId).awaitFirst()

    fun findAllMono(profileId: UUID) =
            template.select<UserRole>().matching(query(where("profile_id").`is`(profileId))).all().collectList()

    suspend fun delete(profileId: UUID) =
            template.delete<UserRole>().matching(query(where("profile_id").`is`(profileId))).allAndAwait()

    suspend fun findAdmin(): UserRole? =
            template.select<UserRole>().matching(query(where("role").`is`(Role.ROLE_ADMIN))).awaitFirstOrNull()
}

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
                    .matching(query(
                            where("profile_id").`is`(profileId).and("type").`is`(type)
                    )).allAndAwait()

    suspend fun deleteByProfileId(profileId: UUID) =
            template.delete<ExpiringToken>().matching(query(where("profile_id").`is`(profileId))).allAndAwait()

    suspend fun findById(id: UUID): ExpiringToken? =
            template.select<ExpiringToken>().matching(query(where("id").`is`(id))).awaitOneOrNull()
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
    suspend fun delete(profileId: UUID) =
            template.delete<EmailChangeHistory>().matching(query(where("profile_id").`is`(profileId))).allAndAwait()
}

class ProfileDeletionFeedbackRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(feedback: ProfileDeletionFeedback): ProfileDeletionFeedback = template.insert<ProfileDeletionFeedback>().usingAndAwait(feedback)
}

class ViewOtherUserProfileTokenDataRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(tokenData: ViewOtherUserProfileTokenData): ViewOtherUserProfileTokenData =
            template.insert<ViewOtherUserProfileTokenData>().usingAndAwait(tokenData)

    suspend fun find(tokenId: UUID): ViewOtherUserProfileTokenData =
            template.select<ViewOtherUserProfileTokenData>().matching(query(where("token_id").`is`(tokenId))).awaitFirst()
}

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

class StatisticsRepository(private val template: R2dbcEntityTemplate) {
    suspend fun registered(): Long = template.count(query(empty()), Email::class.java).awaitFirst()
    suspend fun removed(): Long = template.count(query(empty()), ProfileDeletionFeedback::class.java).awaitFirst()
}

val regionToPopulatedLocality = """
    WITH region_to_populated_locality AS (
        SELECT region_id, populated_locality_id FROM populated_locality_region plr
        UNION
        SELECT region_id, id as "populated_locality_id" FROM populated_locality
    )
""".trimIndent()

class PopulatedLocalitiesRepository(private val client: DatabaseClient) {
    // Ordering:
    // * first output those that start with searched value (case insensitive),
    // * then those that match case insensitive,
    // * and lastly just sort by name
    fun find(query: String): Flux<PopulatedLocality> =
            client.sql("""$regionToPopulatedLocality
                        SELECT pl.id, pl."name", r."name" AS "region", c."name" AS "country"
                        FROM populated_locality pl
                        JOIN region_to_populated_locality rtpl ON rtpl.populated_locality_id = pl.id
                        JOIN region r ON r.id = rtpl.region_id
                        JOIN country c ON c.id = r.country_id
                        WHERE :query = '' OR pl."name" ~* :query OR r."name" ~* :query OR c."name" ~* :query
                        ORDER BY pl."name" ~* concat('^', :query) DESC, pl."name" ~* :query DESC, pl."name" LIMIT 25""".trimIndent())
                    .bind("query", query)
                    .map { row, _ ->
                        PopulatedLocality(
                                row["id"] as UUID,
                                row["name"] as String,
                                row["region"] as String,
                                row["country"] as String
                        )
                    }.all()
}

class LanguagesRepository(private val client: DatabaseClient) {
    fun find(query: String): Flux<Language> =
        client.sql("SELECT * FROM language WHERE :query = '' OR name ~* :query ORDER BY name LIMIT 25")
                .bind("query", query)
                .map { row, _ ->
                    Language(row["id"] as UUID, row["name"] as String)
                }.all()
}

class InterestsRepository(private val client: DatabaseClient) {
    fun find(query: String): Flux<Interest> =
            client.sql("SELECT * FROM interest WHERE :query = '' OR name ~* :query ORDER BY name LIMIT 25")
                    .bind("query", query)
                    .map { row, _ ->
                        Interest(row["id"] as UUID, row["name"] as String)
                    }.all()
}

class PersonalQualitiesRepository(private val client: DatabaseClient) {
    fun find(query: String): Flux<PersonalQuality> =
            client.sql("SELECT * FROM personal_quality WHERE :query = '' OR name ~* :query ORDER BY name LIMIT 25")
                    .bind("query", query)
                    .map { row, _ ->
                        PersonalQuality(row["id"] as UUID, row["name"] as String)
                    }.all()
}

class DatingProfileInfoRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(datingProfileInfo: DatingProfileInfo): DatingProfileInfo =
            template.insert<DatingProfileInfo>().usingAndAwait(datingProfileInfo)
}

class UserPopulatedLocalityRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(userPopulatedLocality: UserPopulatedLocality): UserPopulatedLocality =
            template.insert<UserPopulatedLocality>().usingAndAwait(userPopulatedLocality)
}

class UserLanguageRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(userLanguage: UserLanguage): UserLanguage =
            template.insert<UserLanguage>().usingAndAwait(userLanguage)
}

class UserInterestRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(userInterest: UserInterest): UserInterest =
            template.insert<UserInterest>().usingAndAwait(userInterest)
}

class UserPersonalQualityRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(userPersonalQuality: UserPersonalQuality): UserPersonalQuality =
            template.insert<UserPersonalQuality>().usingAndAwait(userPersonalQuality)
}
