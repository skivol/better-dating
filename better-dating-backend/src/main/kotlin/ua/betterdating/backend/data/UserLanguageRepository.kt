package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import ua.betterdating.backend.UserLanguage
import java.util.*

class UserLanguageRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(userLanguage: UserLanguage): UserLanguage =
            template.insert<UserLanguage>().usingAndAwait(userLanguage)

    suspend fun find(profileId: UUID): List<UserLanguage> = template.select<UserLanguage>()
            .matching(Query.query(Criteria.where("profile_id").`is`(profileId)))
            .all().collectList().awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<UserLanguage>()
            .matching(Query.query(Criteria.where("profile_id").`is`(profileId))).allAndAwait()
}