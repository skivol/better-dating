package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.select
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.r2dbc.core.DatabaseClient
import reactor.core.publisher.Flux
import java.util.*

class PersonalQualitiesRepository(private val client: DatabaseClient, private val template: R2dbcEntityTemplate) {
    fun find(query: String): Flux<PersonalQuality> =
            client.sql("SELECT * FROM personal_quality WHERE :query = '' OR name ~* :query ORDER BY name LIMIT 25")
                    .bind("query", query)
                    .map { row, _ ->
                        PersonalQuality(row["id"] as UUID, row["name"] as String)
                    }.all()

    suspend fun find(ids: List<UUID>): List<PersonalQuality> =
            template.select<PersonalQuality>().matching(Query.query(Criteria.where("id").`in`(ids)))
                    .all().collectList().awaitFirst()
}