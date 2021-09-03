package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria.where
import org.springframework.data.relational.core.query.Query.query
import java.time.Instant
import java.util.*

enum class PairDecisionCategory {
    WantToContinueRelationshipsAndCreateFamily,
    DoNotKnow,
    DoNotWant,
}

class PairDecision(
    @Id val pairId: UUID,
    val profileId: UUID,
    val decision: PairDecisionCategory,
    val createdAt: Instant,
)

class PairDecisionRepository(
    private val template: R2dbcEntityTemplate
) {
    suspend fun save(pairDecision: PairDecision): PairDecision =
        template.insert<PairDecision>().usingAndAwait(pairDecision)

    suspend fun findByPairId(pairId: UUID): List<PairDecision> = template.select<PairDecision>()
        .matching(query(where("pair_id").`is`(pairId)))
        .all().collectList().awaitFirst()

    suspend fun delete(profileId: UUID) = template.delete<PairDecision>()
        .matching(query(where("profile_id").`is`(profileId)))
        .allAndAwait()
}