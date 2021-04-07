package ua.betterdating.backend.data

import io.r2dbc.spi.Row
import org.springframework.r2dbc.core.DatabaseClient
import reactor.core.publisher.Flux
import ua.betterdating.backend.*
import ua.betterdating.backend.ActivityType.*
import ua.betterdating.backend.utils.toAppearanceType
import ua.betterdating.backend.utils.toGender
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

// Note, this entity resembles "Profile" from web entities
class ProfileMatchInformation(
        var id: UUID?,
        // TODO will be needed later when notifying users about the match
        // var email: String,
        // var nickname: String,
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

class PairsRepository(private val client: DatabaseClient) {
    fun usersToFindMatchesFor(): Flux<ProfileMatchInformation> = client.sql(
            // TODO bmi_category view
            """
            WITH latest_height AS (
                    SELECT h.profile_id, height, last FROM height h JOIN (
                        SELECT profile_id, max(date) "last" FROM height GROUP BY profile_id
                    ) lhd ON h.profile_id = lhd.profile_id AND h.date = lhd.last
                 ),
                 latest_weight AS (
                     SELECT w.profile_id, weight, last FROM weight w JOIN (
                         SELECT profile_id, max(date) "last" FROM weight GROUP BY profile_id
                    ) lwd ON w.profile_id = lwd.profile_id AND w.date = lwd.last
                 ),
                 latest_activities AS (
                    SELECT a.profile_id, array_agg(a.name) "activity_names", array_agg(a.recurrence) "activity_recurrences"
                    FROM (
                        SELECT profile_id, name, max(date) "last" FROM activity GROUP BY profile_id, name
                    ) latest_activity
                    JOIN activity a ON latest_activity.profile_id = a.profile_id AND latest_activity.name = a.name AND latest_activity.last = a.date
                    GROUP BY a.profile_id
                 ),
                 user_languages AS (
                    SELECT profile_id, array_agg(id) "language_ids", array_agg(name) "language_names" FROM user_language ul
                    JOIN language l ON l.id = ul.language_id
                    GROUP BY profile_id
                 )
            SELECT pi.profile_id, pi.gender, pi.birthday, lh.height, lw.weight,
               1 "bmi_category", la.activity_names, la.activity_recurrences,
               pl.id "populated_locality_id", pl.name "populated_locality_name", r.name "populated_locality_region", c.name "populated_locality_country",
               ul.language_ids, ul.language_names,
               dpi.appearance_type
            FROM profile_info pi
            JOIN dating_profile_info dpi ON dpi.profile_id = pi.profile_id
            JOIN latest_height lh ON lh.profile_id = pi.profile_id
            JOIN latest_weight lw ON lw.profile_id = pi.profile_id
            JOIN latest_activities la ON la.profile_id = pi.profile_id

            JOIN user_populated_locality upl ON upl.profile_id = pi.profile_id
            JOIN populated_locality pl ON pl.id = upl.populated_locality_id
            JOIN region r ON r.id = pl.region_id
            JOIN country c ON c.id = r.country_id

            JOIN user_languages ul ON ul.profile_id = pi.profile_id

            ORDER BY pi.created_at ASC
            """.trimIndent()
    ).map { row, _ ->
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
    }.all()

    private fun extractLanguages(row: Row): List<Language> {
        val languageIds = row["language_ids"] as Array<UUID>
        val languageNames = row["language_names"] as Array<String>
        return languageIds.zip(languageNames).map { Language(it.first, it.second) }
    }

    private fun extractActivity(row: Row, type: ActivityType): Recurrence {
        val names = row["activity_names"] as Array<String>
        val recurrences = row["activity_recurrences"] as Array<String>
        return Recurrence.valueOf(recurrences[names.indexOf(type.toString())])
    }

    fun findCandidates(
            candidateGender: Gender, bmiCategory: Int, candidateBirthdayFrom: LocalDate,
            candidateBirthdayTo: LocalDate, candidateHeightFrom: Float, candidateHeightTo: Float,
            candidateSmoking: List<Recurrence>, candidateAlcohol: List<Recurrence>,
            candidatePornographyWatching: List<Recurrence>, candidateIntimateRelationsOutsideOfMarriage: List<Recurrence>,
            appearanceType: AppearanceType, populatedLocalityId: UUID, nativeLanguages: List<Language>
    ): Flux<ProfileMatchInformation> {
        TODO("Not yet implemented")
    }
}