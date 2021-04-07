package ua.betterdating.backend.data

import org.springframework.data.domain.Sort
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import ua.betterdating.backend.ProfileEvaluation
import java.util.*

class ProfileEvaluationRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(profileEvaluation: ProfileEvaluation): ProfileEvaluation = template.insert<ProfileEvaluation>().usingAndAwait(profileEvaluation)

    suspend fun findLatestHealthEvaluationByProfileId(profileId: UUID): ProfileEvaluation =
            template.select<ProfileEvaluation>().matching(Query.query(
                    Criteria.where("source_profile_id").`is`(profileId).and("target_profile_id").`is`(profileId)
            ).sort(Sort.by(Sort.Direction.DESC, "date")).limit(1)).awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<ProfileEvaluation>().matching(
            Query.query(Criteria.where("source_profile_id").`is`(profileId).and("target_profile_id").`is`(profileId))
    ).allAndAwait()
}