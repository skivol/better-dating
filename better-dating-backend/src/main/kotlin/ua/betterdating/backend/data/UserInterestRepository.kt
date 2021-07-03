package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import java.util.*

class UserInterestRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(userInterest: UserInterest): UserInterest =
            template.insert<UserInterest>().usingAndAwait(userInterest)

    suspend fun find(profileId: UUID): List<UserInterest> =
            template.select<UserInterest>()
                    .matching(Query.query(Criteria.where("profile_id").`is`(profileId)))
                    .all().collectList().awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<UserInterest>()
            .matching(Query.query(Criteria.where("profile_id").`is`(profileId))).allAndAwait()
}