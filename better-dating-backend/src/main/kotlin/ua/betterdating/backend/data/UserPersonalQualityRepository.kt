package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import ua.betterdating.backend.Attitude
import ua.betterdating.backend.UserPersonalQuality
import java.util.*

class UserPersonalQualityRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(userPersonalQuality: UserPersonalQuality): UserPersonalQuality =
            template.insert<UserPersonalQuality>().usingAndAwait(userPersonalQuality)

    suspend fun find(profileId: UUID, attitude: Attitude): List<UserPersonalQuality> =
            template.select<UserPersonalQuality>().matching(Query.query(Criteria.where("profile_id").`is`(profileId).and("attitude").`is`(attitude)))
                    .all().collectList().awaitFirst()

    suspend fun delete(profileId: UUID, attitude: Attitude) = template.delete<UserPersonalQuality>()
            .matching(Query.query(Criteria.where("profile_id").`is`(profileId).and("attitude").`is`(attitude))).allAndAwait()
}