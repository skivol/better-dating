package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import java.util.*

class ViewOtherUserProfileTokenDataRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(tokenData: ViewOtherUserProfileTokenData): ViewOtherUserProfileTokenData =
            template.insert<ViewOtherUserProfileTokenData>().usingAndAwait(tokenData)

    suspend fun find(tokenId: UUID): ViewOtherUserProfileTokenData =
            template.select<ViewOtherUserProfileTokenData>().matching(Query.query(Criteria.where("token_id").`is`(tokenId))).awaitFirst()
}