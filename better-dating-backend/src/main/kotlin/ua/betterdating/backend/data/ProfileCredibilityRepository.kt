package ua.betterdating.backend.data

import org.springframework.data.annotation.Id
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.insert
import org.springframework.data.r2dbc.core.usingAndAwait
import java.time.Instant
import java.util.*

enum class CredibilityCategory {
    CredibleEnoughInformation, SomethingSeemsWrong, SomePartsAreDefinitelyWrong
}
class ProfileCredibility(
    @Id val dateId: UUID,
    val sourceProfileId: UUID,
    val targetProfileId: UUID,
    val category: CredibilityCategory,
    val comment: String?,
    val createdAt: Instant,
)
class ProfileCredibilityRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(profileCredibility: ProfileCredibility): ProfileCredibility = template.insert<ProfileCredibility>().usingAndAwait(profileCredibility)
}