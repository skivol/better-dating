package ua.betterdating.backend.data

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.r2dbc.postgresql.codec.Json
import io.r2dbc.spi.Row
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.reactive.asFlow
import kotlinx.coroutines.reactive.awaitSingle
import kotlinx.coroutines.withContext
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.*
import org.springframework.r2dbc.core.*
import org.springframework.r2dbc.core.DatabaseClient
import reactor.core.publisher.Flux
import ua.betterdating.backend.*
import ua.betterdating.backend.ActivityType.*
import ua.betterdating.backend.utils.toAppearanceType
import ua.betterdating.backend.utils.toGender
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

// Note, this entity resembles "Profile" from web entities
data class ProfileMatchInformation(
    val id: UUID,
    val gender: Gender,
    val birthday: LocalDate,
    val height: Float,
    val weight: Float,

    val bmiCategory: Int,

    val smoking: Recurrence,
    val alcohol: Recurrence,
    val intimateRelationsOutsideOfMarriage: Recurrence,
    val pornographyWatching: Recurrence,

    val populatedLocality: PopulatedLocality,
    val nativeLanguages: List<Language>,
    val appearanceType: AppearanceType,
)

data class ProfileMatchInformationWithEmail(
    val email: String,
    val nickname: String,
    val profileMatchInformation: ProfileMatchInformation
)

class DatingPair(
    @Id val id: UUID = UUID.randomUUID(),
    val firstProfileId: UUID,
    val secondProfileId: UUID,
    val goal: DatingGoal,
    val whenMatched: LocalDateTime,
    val active: Boolean,
    var firstProfileSnapshot: ProfileMatchInformation? = null,
    var secondProfileSnapshot: ProfileMatchInformation? = null,
)

class DatingPairWithNicknames(
    val firstProfileNickname: String?,
    val secondProfileNickname: String?,
    val datingPair: DatingPair
)

class DatingPairLock(
    @Id val profileId: UUID
)

val latestHeight = """
    latest_height AS (
        SELECT h.profile_id, height, last FROM height h JOIN (
            SELECT profile_id, max(date) "last" FROM height GROUP BY profile_id
        ) lhd ON h.profile_id = lhd.profile_id AND h.date = lhd.last
     )
""".trimIndent()
val latestWeight = """
    latest_weight AS (
         SELECT w.profile_id, weight, last FROM weight w JOIN (
             SELECT profile_id, max(date) "last" FROM weight GROUP BY profile_id
        ) lwd ON w.profile_id = lwd.profile_id AND w.date = lwd.last
     )
""".trimIndent()
val latestActivities = """
    latest_activities AS (
        SELECT a.profile_id, array_agg(a.name) "activity_names", array_agg(a.recurrence) "activity_recurrences"
        FROM (
            SELECT profile_id, name, max(date) "last" FROM activity GROUP BY profile_id, name
        ) latest_activity
        JOIN activity a ON latest_activity.profile_id = a.profile_id AND latest_activity.name = a.name AND latest_activity.last = a.date
        GROUP BY a.profile_id
     )
""".trimIndent()
val userLanguages = """
    user_languages AS (
        SELECT profile_id, array_agg(id) "language_ids", array_agg(name) "language_names" FROM user_language ul
        JOIN language l ON l.id = ul.language_id
        GROUP BY profile_id
     )
""".trimIndent()
const val bmiValue = "(lw.weight / (lh.height * lh.height / 10000))";
val bmiCategory = """
    bmi_category AS (
        SELECT lh.profile_id,
        CASE
            WHEN $bmiValue <= 16 THEN 1
            WHEN $bmiValue <= 18.5 THEN 2
            WHEN $bmiValue <= 25 THEN 3
            WHEN $bmiValue <= 30 THEN 4
            WHEN $bmiValue <= 35 THEN 5
            WHEN $bmiValue <= 40 THEN 6
            WHEN $bmiValue > 40 THEN 7
        END "category"
        FROM latest_height lh
        JOIN latest_weight lw ON lw.profile_id = lh.profile_id
     )
""".trimIndent()

class PairsRepository(
    private val client: DatabaseClient,
    private val template: R2dbcEntityTemplate,
    private val mapper: ObjectMapper
) {
    fun usersToFindMatchesFor(): Flux<ProfileMatchInformationWithEmail> = client.sql(
        """
            WITH $latestHeight,
                 $latestWeight,
                 $latestActivities,
                 $userLanguages,
                 $bmiCategory
            SELECT e.email, pi.nickname, pi.profile_id, pi.gender, pi.birthday, lh.height, lw.weight,
               bc.category "bmi_category", la.activity_names, la.activity_recurrences,
               pl.id "populated_locality_id", pl.name "populated_locality_name", r.name "populated_locality_region", c.name "populated_locality_country",
               ul.language_ids, ul.language_names,
               dpi.appearance_type
            FROM profile_info pi
            JOIN email e ON e.id = pi.profile_id
            JOIN dating_profile_info dpi ON dpi.profile_id = pi.profile_id
            JOIN latest_height lh ON lh.profile_id = pi.profile_id
            JOIN latest_weight lw ON lw.profile_id = pi.profile_id
            JOIN bmi_category bc ON bc.profile_id = pi.profile_id
            JOIN latest_activities la ON la.profile_id = pi.profile_id

            JOIN user_populated_locality upl ON upl.profile_id = pi.profile_id
            JOIN populated_locality pl ON pl.id = upl.populated_locality_id
            JOIN region r ON r.id = pl.region_id
            JOIN country c ON c.id = r.country_id

            JOIN user_languages ul ON ul.profile_id = pi.profile_id
            
            LEFT JOIN dating_pair_lock dpl ON dpl.profile_id = pi.profile_id
            
            WHERE e.verified 
            AND dpl.profile_id IS NULL

            ORDER BY pi.created_at ASC
            """.trimIndent()
    ).map { row, _ -> extractProfileMatchInformationWithEmail(row) }.all()

    fun findCandidates(
        targetProfileId: UUID,
        candidateGender: Gender, candidateBmi: Int, candidateBirthdayFrom: LocalDate,
        candidateBirthdayTo: LocalDate, candidateHeightFrom: Float, candidateHeightTo: Float,
        candidateSmoking: List<Recurrence>, candidateAlcohol: List<Recurrence>,
        candidatePornographyWatching: List<Recurrence>, candidateIntimateRelationsOutsideOfMarriage: List<Recurrence>,
        appearanceType: AppearanceType, populatedLocalityId: UUID, nativeLanguages: List<Language>
    ): Flux<ProfileMatchInformationWithEmail> = client.sql(
        """
            WITH $latestHeight,
                 $latestWeight,
                 $latestActivities,
                 $userLanguages,
                 $bmiCategory
            SELECT e.email, pi.nickname, pi.profile_id, pi.gender, pi.birthday, lh.height, lw.weight,
               bc.category "bmi_category", la.activity_names, la.activity_recurrences,
               pl.id "populated_locality_id", pl.name "populated_locality_name", r.name "populated_locality_region", c.name "populated_locality_country",
               ul.language_ids, ul.language_names,
               dpi.appearance_type
            FROM profile_info pi
            JOIN email e ON e.id = pi.profile_id
            JOIN dating_profile_info dpi ON dpi.profile_id = pi.profile_id
            JOIN latest_height lh ON lh.profile_id = pi.profile_id
            JOIN latest_weight lw ON lw.profile_id = pi.profile_id
            JOIN bmi_category bc ON bc.profile_id = pi.profile_id
            JOIN latest_activities la ON la.profile_id = pi.profile_id

            JOIN user_populated_locality upl ON upl.profile_id = pi.profile_id
            JOIN populated_locality pl ON pl.id = upl.populated_locality_id
            JOIN region r ON r.id = pl.region_id
            JOIN country c ON c.id = r.country_id

            JOIN user_languages ul ON ul.profile_id = pi.profile_id

            LEFT JOIN dating_pair_lock dpl ON dpl.profile_id = pi.profile_id
            LEFT JOIN dating_pair dp ON (
                (dp.first_profile_id = pi.profile_id AND dp.second_profile_id = '$targetProfileId')
                OR
                (dp.second_profile_id = pi.profile_id AND dp.first_profile_id = '$targetProfileId')
            )
            
            WHERE e.verified 
                AND pi.gender = '$candidateGender'
                AND bc.category = $candidateBmi
                AND pi.birthday BETWEEN '$candidateBirthdayFrom' AND '$candidateBirthdayTo'
                AND lh.height BETWEEN $candidateHeightFrom AND $candidateHeightTo
                AND array_position(${recurrencesArray(candidateSmoking)}, la.activity_recurrences[array_position(la.activity_names, 'smoking')]) IS NOT NULL
                AND array_position(${recurrencesArray(candidateAlcohol)}, la.activity_recurrences[array_position(la.activity_names, 'alcohol')]) IS NOT NULL
                AND array_position(${recurrencesArray(candidatePornographyWatching)}, la.activity_recurrences[array_position(la.activity_names, 'pornographyWatching')]) IS NOT NULL
                AND array_position(${recurrencesArray(candidateIntimateRelationsOutsideOfMarriage)}, la.activity_recurrences[array_position(la.activity_names, 'intimateRelationsOutsideOfMarriage')]) IS NOT NULL
                AND dpi.appearance_type = '$appearanceType'
                AND upl.populated_locality_id = '$populatedLocalityId'
                AND ul.language_ids::uuid[] && ${uuidArray(nativeLanguages)}
                
                AND dpl.profile_id IS NULL
                AND dp.first_profile_id IS NULL

            ORDER BY pi.created_at ASC
        """.trimIndent()
    ).map { row, _ -> extractProfileMatchInformationWithEmail(row) }.all()

    /* JsonByteArrayInput is handled as persistent entity and gets NullBinding in the end... not good...
       (if using "template.insert<DatingPair>().usingAndAwait(pair)" + @WritingConverter ... : Converter<ProfileMatchInformation, Json> / Converter<DatingPair, OutboundRow>
        customConversionsCustomizer = {
            // is it possible to re-use web jackson ?
            val mapper = jacksonObjectMapper()
            val converters = listOf(ProfileMatchInformationToJsonConverter(mapper), JsonToProfileMatchInformationConverter(mapper))
            R2dbcCustomConversions(converters)
        })
       some similar problem (https://github.com/spring-projects/spring-data-r2dbc/issues/585)

       Related docs:
       * https://docs.spring.io/spring-data/r2dbc/docs/current/reference/html/#mapping.explicit.enum.converters
       * https://medium.com/@nikola.babic1/mapping-to-json-fields-with-spring-data-r2dbc-and-reactive-postgres-driver-1db765067dc5
       */
    suspend fun save(pair: DatingPair): Int {
        // https://stackoverflow.com/a/64306690
        val firstProfileSnapshotJson =
            Json.of(withContext(Dispatchers.IO) { mapper.writeValueAsString(pair.firstProfileSnapshot) })
        val secondProfileSnapshotJson =
            Json.of(withContext(Dispatchers.IO) { mapper.writeValueAsString(pair.secondProfileSnapshot) })

        return client.sql(
            """
        INSERT INTO dating_pair("id", "first_profile_id", "second_profile_id", "goal", "when_matched", "active", "first_profile_snapshot", "second_profile_snapshot")
        VALUES(:id, :firstProfileId, :secondProfileId, :goal, :whenMatched, :active, :firstProfileSnapshot, :secondProfileSnapshot)
        """.trimIndent()
        ).bind("firstProfileId", pair.firstProfileId).bind("secondProfileId", pair.secondProfileId)
            .bind("id", pair.id)
            .bind("goal", pair.goal.toString()).bind("active", pair.active)
            .bind("whenMatched", pair.whenMatched)
            .bind("firstProfileSnapshot", firstProfileSnapshotJson)
            .bind("secondProfileSnapshot", secondProfileSnapshotJson)
            .fetch().awaitRowsUpdated()
    }

    suspend fun save(pairLock: DatingPairLock): DatingPairLock =
        template.insert<DatingPairLock>().usingAndAwait(pairLock)

    suspend fun findPair(one: UUID, other: UUID): DatingPair? =
        client.sql(
            """
                SELECT * FROM dating_pair
                WHERE (
                    (first_profile_id = :first_profile_id AND second_profile_id = :second_profile_id)
                    OR
                    (first_profile_id = :second_profile_id AND second_profile_id = :first_profile_id)
                )
            """.trimIndent()
        ).bind("first_profile_id", one)
            .bind("second_profile_id", other)
            .map { row, _ ->
                extractDatingPair(row)
            }.awaitOneOrNull()

    suspend fun findRelevantPairs(profileId: UUID): List<DatingPairWithNicknames> =
        client.sql(
            """
                SELECT
                    dp.*, pi1.nickname "first_nickname", pi2.nickname "second_nickname"
                FROM dating_pair dp
                LEFT JOIN profile_info pi1 ON pi1.profile_id = dp.first_profile_id
                LEFT JOIN profile_info pi2 ON pi2.profile_id = dp.second_profile_id
                WHERE first_profile_id = :profile_id OR second_profile_id = :profile_id
            """.trimIndent()
        ).bind("profile_id", profileId)
            .map { row, _ ->
                DatingPairWithNicknames(
                    row["first_nickname"] as String?,
                    row["second_nickname"] as String?,
                    extractDatingPair(row)
                )
            }.all().collectList().awaitSingle()

    fun findActivePairsWithoutDates() =
        client.sql(
            """
                SELECT dp.id, first_profile_id, second_profile_id, goal, when_matched, active, first_profile_snapshot, second_profile_snapshot
                FROM dating_pair dp
                LEFT JOIN dates d ON d.pair_id = dp.id
                WHERE dp.active AND d.id IS NULL
            """.trimIndent())
            .map { row, _ -> extractDatingPair(row)}
            .all().asFlow()

    suspend fun findPairByDate(dateId: UUID): DatingPair =
        client.sql(
            """
                SELECT dp.* FROM dating_pair dp
                JOIN dates d ON d.pair_id = dp.id
                WHERE d.id = :dateId
            """.trimIndent()
        ).bind("dateId", dateId)
            .map { row, _ -> extractDatingPair(row)}
            .awaitSingle()

    private fun extractDatingPair(row: Row): DatingPair = DatingPair(
        row["id"] as UUID,
        row["first_profile_id"] as UUID, row["second_profile_id"] as UUID,
        DatingGoal.valueOf(row["goal"] as String), row["when_matched"] as LocalDateTime,
        row["active"] as Boolean,
        row["first_profile_snapshot"]?.let { mapper.readValue((it as Json).asArray()) }, // TODO run this in Dispatchers.IO ?
        row["second_profile_snapshot"]?.let { mapper.readValue((it as Json).asArray()) }
    )

    private fun extractProfileMatchInformationWithEmail(row: Row): ProfileMatchInformationWithEmail =
        ProfileMatchInformationWithEmail(
            row["email"] as String,
            row["nickname"] as String,
            ProfileMatchInformation(
                row["profile_id"] as UUID,
                row["gender"].toGender(),
                row["birthday"] as LocalDate,
                (row["height"] as BigDecimal).toFloat(),
                (row["weight"] as BigDecimal).toFloat(),

                row["bmi_category"] as Int,

                extractActivity(row, smoking),
                extractActivity(row, alcohol),
                extractActivity(row, intimateRelationsOutsideOfMarriage),
                extractActivity(row, pornographyWatching),

                PopulatedLocality(
                    row["populated_locality_id"] as UUID,
                    row["populated_locality_name"] as String,
                    row["populated_locality_region"] as String,
                    row["populated_locality_country"] as String,
                ),
                extractLanguages(row),
                row["appearance_type"].toAppearanceType(),
            )
        )

    @Suppress("UNCHECKED_CAST")
    private fun extractLanguages(row: Row): List<Language> {
        val languageIds = row["language_ids"] as Array<UUID>
        val languageNames = row["language_names"] as Array<String>
        return languageIds.zip(languageNames).map { Language(it.first, it.second) }
    }

    @Suppress("UNCHECKED_CAST")
    private fun extractActivity(row: Row, type: ActivityType): Recurrence {
        val names = row["activity_names"] as Array<String>
        val recurrences = row["activity_recurrences"] as Array<String>
        return Recurrence.valueOf(recurrences[names.indexOf(type.toString())])
    }

    private fun uuidArray(languages: List<Language>) = "array[${languages.joinToString(",") { "'${it.id}'" }}]::uuid[]"

    private fun recurrencesArray(recurrences: List<Recurrence>) =
        "array[${recurrences.joinToString(",") { "'$it'" }}]::varchar[]"
}