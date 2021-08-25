package ua.betterdating.backend.data

import io.r2dbc.spi.Row
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.allAndAwait
import org.springframework.data.r2dbc.core.delete
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.r2dbc.core.*
import ua.betterdating.backend.handlers.LatLng
import java.time.Clock
import java.time.Instant
import java.time.OffsetDateTime
import java.util.*

enum class PlaceStatus {
    WaitingForApproval, Approved
}
data class Place(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val longitude: Double,
    val latitude: Double,
    val populatedLocalityId: UUID,
    val suggestedBy: UUID,
    val status: PlaceStatus,
    val version: Int,
    val approvedBy: UUID? = null,
    val createdAt: Instant = Instant.now(Clock.systemUTC()),
)

const val distance = 30.0
class PlaceRepository(
    private val client: DatabaseClient,
    private val template: R2dbcEntityTemplate,
) {
    suspend fun fetchTooClosePlaces(populatedLocalityId: UUID, longitude: Double, latitude: Double, distance: Double): List<Place> = client.sql("""
        WITH $nearPlaces
        SELECT *, ST_x(location::geometry) "longitude", ST_y(location::geometry) "latitude"
        FROM near_places nps WHERE ST_DWithin(nps.location, ST_MakePoint(:longitude, :latitude), :distance)
    """.trimIndent())
        .bind("populatedLocalityId", populatedLocalityId)
        .bind("longitude", longitude)
        .bind("latitude", latitude)
        .bind("distance", distance)
        .map {row, _ -> extractPlace(row)}
        .all().collectList().awaitSingle()

    suspend fun upsert(place: Place, distance: Double): Int = client.sql("""
        WITH $nearPlaces,
        new_place AS (SELECT :id, :version, :name, :populatedLocalityId, :suggestedBy, :status, ST_MakePoint(:longitude, :latitude) "location", :approvedBy, :createdAt)

        INSERT INTO place (id, version, name, populated_locality_id, suggested_by, status, location, approved_by, created_at)
        SELECT np.*
        FROM new_place np
        WHERE NOT EXISTS (
            SELECT * FROM near_places nps WHERE ST_DWithin(nps.location, np.location, :distance)
        )
        ON CONFLICT (id, version) DO UPDATE SET
            name = EXCLUDED.name, status = EXCLUDED.status,
            approved_by = EXCLUDED.approved_by, location = EXCLUDED.location
    """.trimIndent())
        .bind("id", place.id)
        .bind("name", place.name)
        .bind("populatedLocalityId", place.populatedLocalityId)
        .bind("suggestedBy", place.suggestedBy)
        .bind("status", place.status.toString())
        .bind("version", place.version)
        .bind("longitude", place.longitude)
        .bind("latitude", place.latitude)
        .bind("approvedBy", place.approvedBy)
        .bind("createdAt", place.createdAt)
        .bind("distance", distance)
        .fetch().awaitRowsUpdated()

    suspend fun allById(placeId: UUID): List<Place> = client.sql("""
        SELECT p.*, ST_x(location::geometry) "longitude", ST_y(location::geometry) "latitude"
        FROM place p
        WHERE p.id = :placeId
    """.trimIndent())
        .bind("placeId", placeId)
        .map { row, _ -> extractPlace(row)}
        .all()
        .collectList()
        .awaitSingle()

    suspend fun deleteAllById(placeId: UUID): Int = template.delete<Place>()
        .matching(Query.query(Criteria.where("id").`is`(placeId)))
        .allAndAwait()
}

fun extractPlace(row: Row, prefix: String = ""): Place = Place(
    row["${prefix}id"] as UUID,
    row["${prefix}name"] as String,
    row["${prefix}longitude"] as Double,
    row["${prefix}latitude"] as Double,
    row["${prefix}populated_locality_id"] as UUID,
    row["${prefix}suggested_by"] as UUID,
    PlaceStatus.valueOf(row["${prefix}status"] as String),
    row["${prefix}version"] as Int,
    row["${prefix}approved_by"] as UUID?,
    (row["${prefix}created_at"] as OffsetDateTime).toInstant(),
)
