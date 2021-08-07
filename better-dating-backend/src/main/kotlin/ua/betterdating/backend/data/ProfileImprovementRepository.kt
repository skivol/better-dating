package ua.betterdating.backend.data

import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.insert
import org.springframework.data.r2dbc.core.usingAndAwait
import java.time.Instant
import java.util.*

enum class ImprovementCategory {
    LooksGoodToMe, SomethingCouldBeImprovedButNotSureWhat, SomeThingsCanBeImproved
}
class ProfileImprovement(
    @Id val dateId: UUID,
    val sourceProfileId: UUID,
    val targetProfileId: UUID,
    val category: ImprovementCategory,
    val comment: String?,
    val createdAt: Instant,
)
class ProfileImprovementRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(profileImprovement: ProfileImprovement): ProfileImprovement = template.insert<ProfileImprovement>().usingAndAwait(profileImprovement)
}