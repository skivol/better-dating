package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import ua.betterdating.backend.AcceptedTerms
import java.util.*

class AcceptedTermsRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(acceptedTerms: AcceptedTerms): AcceptedTerms =
            template.insert<AcceptedTerms>().usingAndAwait(acceptedTerms)

    suspend fun delete(profileId: UUID) = template.delete<AcceptedTerms>().matching(
            Query.query(Criteria.where("profile_id").`is`(profileId))
    ).allAndAwait()
}