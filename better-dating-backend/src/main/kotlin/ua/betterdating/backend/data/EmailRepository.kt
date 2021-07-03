package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.data.relational.core.query.Update
import java.util.*

class EmailRepository(templateSupplier: Lazy<R2dbcEntityTemplate>) {
    private val template by templateSupplier

    fun findByEmailMono(email: String) = template.select<Email>()
            .matching(Query.query(Criteria.where("email").`is`(email))).one()

    suspend fun findByEmail(email: String) = findByEmailMono(email).awaitFirstOrNull()

    suspend fun save(email: Email): Email = template.insert<Email>().usingAndAwait(email)

    suspend fun findById(id: UUID): Email? = template.select<Email>()
            .matching(Query.query(Criteria.where("id").`is`(id))).one()
            .awaitFirstOrNull()

    fun updateMono(email: Email) = template.update<Email>()
            .matching(Query.query(Criteria.where("id").`is`(email.id)))
            .apply(Update.update("email", email.email).set("verified", email.verified))

    suspend fun update(email: Email): Int = updateMono(email).awaitSingle()

    suspend fun delete(profileId: UUID) = template.delete<Email>().matching(
            Query.query(Criteria.where("id").`is`(profileId))
    ).allAndAwait()
}