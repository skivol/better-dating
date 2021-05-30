package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.data.relational.core.query.Update
import ua.betterdating.backend.ProfileInfo
import java.util.*

class ProfileInfoRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(profileInfo: ProfileInfo): ProfileInfo =
            template.insert<ProfileInfo>().usingAndAwait(profileInfo)

    suspend fun findByProfileId(profileId: UUID) =
            template.select<ProfileInfo>().matching(Query.query(Criteria.where("profile_id").`is`(profileId))).awaitFirstOrNull()

    suspend fun update(profileInfo: ProfileInfo): Int = template.update<ProfileInfo>()
            .matching(Query.query(Criteria.where("profile_id").`is`(profileInfo.profileId)))
            .applyAndAwait(Update.update("gender", profileInfo.gender).set("birthday", profileInfo.birthday).set("updated_at", profileInfo.updatedAt))

    suspend fun delete(profileId: UUID) = template.delete<ProfileInfo>().matching(
            Query.query(Criteria.where("profile_id").`is`(profileId))
    ).allAndAwait()
}