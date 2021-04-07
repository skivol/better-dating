package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitSingle
import reactor.core.publisher.Flux
import ua.betterdating.backend.PopulatedLocality
import java.util.*

val regionToPopulatedLocality = """
    WITH region_to_populated_locality AS (
        SELECT region_id, populated_locality_id FROM populated_locality_region plr
        UNION
        SELECT region_id, id as "populated_locality_id" FROM populated_locality
    )
""".trimIndent()
val selectFullPopulatedLocality = """
    $regionToPopulatedLocality
    SELECT pl.id, pl."name", r."name" AS "region", c."name" AS "country"
    FROM populated_locality pl
    JOIN region_to_populated_locality rtpl ON rtpl.populated_locality_id = pl.id
    JOIN region r ON r.id = rtpl.region_id
    JOIN country c ON c.id = r.country_id
""".trimIndent()

class PopulatedLocalitiesRepository(private val client: DatabaseClient, private val template: R2dbcEntityTemplate) {
    // Ordering:
    // * first output those that start with searched value (case insensitive),
    // * then those that match case insensitive,
    // * and lastly just sort by name
    fun find(query: String): Flux<PopulatedLocality> =
            client.sql("""$selectFullPopulatedLocality
                        WHERE :query = '' OR pl."name" ~* :query OR r."name" ~* :query OR c."name" ~* :query
                        ORDER BY pl."name" ~* concat('^', :query) DESC, pl."name" ~* :query DESC, pl."name" LIMIT 25""".trimIndent())
                    .bind("query", query)
                    .map { row, _ ->
                        PopulatedLocality(
                                row["id"] as UUID,
                                row["name"] as String,
                                row["region"] as String,
                                row["country"] as String
                        )
                    }.all()

    suspend fun findById(populatedLocalityId: UUID): PopulatedLocality = client.sql("""$selectFullPopulatedLocality
        WHERE pl.id = :populatedLocalityId
    """.trimIndent()).bind("populatedLocalityId", populatedLocalityId).map { row, _ ->
        PopulatedLocality(
                row["id"] as UUID,
                row["name"] as String,
                row["region"] as String,
                row["country"] as String
        )
    }.awaitSingle()
}