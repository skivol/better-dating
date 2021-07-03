package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.allAndAwait
import org.springframework.data.r2dbc.core.delete
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import java.util.*

class EmailChangeHistoryRepository(private val template: R2dbcEntityTemplate) {
    suspend fun delete(profileId: UUID) =
            template.delete<EmailChangeHistory>().matching(Query.query(Criteria.where("profile_id").`is`(profileId))).allAndAwait()
}