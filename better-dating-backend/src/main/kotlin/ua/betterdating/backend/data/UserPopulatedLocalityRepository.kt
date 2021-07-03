package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.data.relational.core.query.Update
import java.util.*

class UserPopulatedLocalityRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(userPopulatedLocality: UserPopulatedLocality): UserPopulatedLocality =
            template.insert<UserPopulatedLocality>().usingAndAwait(userPopulatedLocality)

    suspend fun find(profileId: UUID): UserPopulatedLocality =
            template.select<UserPopulatedLocality>().matching(Query.query(Criteria.where("profile_id").`is`(profileId)))
                    .awaitFirst()

    suspend fun update(updated: UserPopulatedLocality) =
            template.update<UserPopulatedLocality>()
                    .matching(Query.query(Criteria.where("profile_id").`is`(updated.profileId).and("position").`is`(updated.position)))
                    .apply(Update.update("populated_locality_id", updated.populatedLocalityId)).awaitSingle()

    suspend fun delete(profileId: UUID) =
            template.delete<UserPopulatedLocality>().matching(Query.query(Criteria.where("profile_id").`is`(profileId))).allAndAwait()
}