package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import ua.betterdating.backend.Email
import ua.betterdating.backend.ProfileDeletionFeedback

class StatisticsRepository(private val template: R2dbcEntityTemplate) {
    suspend fun registered(): Long = template.count(Query.query(Criteria.empty()), Email::class.java).awaitFirst()
    suspend fun removed(): Long = template.count(Query.query(Criteria.empty()), ProfileDeletionFeedback::class.java).awaitFirst()
}