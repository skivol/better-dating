package ua.betterdating.backend.data

import org.springframework.data.domain.Sort
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import ua.betterdating.backend.Weight
import java.util.*

class WeightRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(weight: Weight): Weight = template.insert<Weight>().usingAndAwait(weight)

    suspend fun findLatestByProfileId(profileId: UUID): Weight =
            template.select<Weight>().matching(Query.query(
                    Criteria.where("profile_id").`is`(profileId)
            ).sort(Sort.by(Sort.Direction.DESC, "date")).limit(1)).awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<Weight>().matching(
            Query.query(Criteria.where("profile_id").`is`(profileId))
    ).allAndAwait()
}