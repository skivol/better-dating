package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.insert
import org.springframework.data.r2dbc.core.usingAndAwait
import java.util.*

class DatingPairLock(
    @Id val profileId: UUID
)

class PairLockRepository(
    private val template: R2dbcEntityTemplate
) {
    suspend fun save(pairLock: DatingPairLock): DatingPairLock =
        template.insert<DatingPairLock>().usingAndAwait(pairLock)

    suspend fun delete(pairLock: DatingPairLock) = template.delete(pairLock).awaitFirstOrNull()
}