package ua.betterdating.backend.data

import io.r2dbc.spi.Row
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.awaitOne
import org.springframework.r2dbc.core.awaitRowsUpdated
import ua.betterdating.backend.handlers.LatLng
import java.util.*

enum class PlaceStatus {
    waitingForApproval, approved
}
class Place(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val longitude: Double,
    val latitude: Double,
    val populatedLocalityId: UUID,
    val suggestedBy: UUID,
    val status: PlaceStatus,
)
class PlaceRepository(
    private val client: DatabaseClient,
    private val template: R2dbcEntityTemplate,
) {
    suspend fun fetchTooClosePoints(populatedLocalityId: UUID, longitude: Double, latitude: Double, distance: Double): List<LatLng> = client.sql("""
        WITH $nearPlaces
        SELECT ST_x(location::geometry) "longitude", ST_y(location::geometry) "latitude"
        FROM near_places nps WHERE ST_DWithin(nps.location, ST_MakePoint(:longitude, :latitude), :distance)
    """.trimIndent())
        .bind("populatedLocalityId", populatedLocalityId)
        .bind("longitude", longitude)
        .bind("latitude", latitude)
        .bind("distance", distance)
        .map {row, _ -> LatLng(row["latitude"] as Double, row["longitude"] as Double)}
        .all().collectList().awaitSingle()

    suspend fun save(place: Place, distance: Double): Int = client.sql("""
        WITH $nearPlaces,
        new_place AS (SELECT :id, :name, :populatedLocalityId, :suggestedBy, :status, ST_MakePoint(:longitude, :latitude) "location")
        
        INSERT INTO place (id, name, populated_locality_id, suggested_by, status, location)
        SELECT np.*
        FROM new_place np
        WHERE NOT EXISTS (
            SELECT * FROM near_places nps WHERE ST_DWithin(nps.location, np.location, :distance)
        )
    """.trimIndent())
        .bind("id", place.id)
        .bind("name", place.name)
        .bind("populatedLocalityId", place.populatedLocalityId)
        .bind("suggestedBy", place.suggestedBy)
        .bind("status", place.status.toString())
        .bind("longitude", place.longitude)
        .bind("latitude", place.latitude)
        .bind("distance", distance)
        .fetch().awaitRowsUpdated()

    suspend fun byId(placeId: UUID): Place = client.sql("""
        SELECT p.*, ST_x(location::geometry) "longitude", ST_y(location::geometry) "latitude"
        FROM place p
        WHERE p.id = :placeId
    """.trimIndent())
        .bind("placeId", placeId)
        .map { row, _ -> extractPlace(row)}
        .awaitOne()

    suspend fun approve(placeId: UUID, approvedBy: UUID) = client.sql("""
        UPDATE place SET status = 'approved', approved_by = :approvedBy WHERE id = :placeId
    """.trimIndent())
        .bind("placeId", placeId)
        .bind("approvedBy", approvedBy)
        .fetch().awaitRowsUpdated()
}

fun extractPlace(row: Row, prefix: String = ""): Place = Place(
    row["${prefix}id"] as UUID,
    row["${prefix}name"] as String,
    row["${prefix}longitude"] as Double,
    row["${prefix}latitude"] as Double,
    row["${prefix}populated_locality_id"] as UUID,
    row["${prefix}suggested_by"] as UUID,
    PlaceStatus.valueOf(row["${prefix}status"] as String),
)
