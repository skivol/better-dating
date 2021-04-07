package ua.betterdating.backend.data

import org.springframework.data.domain.Sort
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import ua.betterdating.backend.Height
import java.util.*

class HeightRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(height: Height): Height = template.insert<Height>().usingAndAwait(height)

    suspend fun findLatestByProfileId(profileId: UUID): Height =
            template.select<Height>().matching(Query.query(
                    Criteria.where("profile_id").`is`(profileId)
            ).limit(1).sort(Sort.by(Sort.Direction.DESC, "date"))).awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<Height>().matching(
            Query.query(Criteria.where("profile_id").`is`(profileId))
    ).allAndAwait()
}