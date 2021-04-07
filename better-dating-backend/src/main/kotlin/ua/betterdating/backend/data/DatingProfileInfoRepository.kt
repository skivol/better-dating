package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import org.springframework.data.relational.core.query.Update
import ua.betterdating.backend.DatingProfileInfo
import java.util.*

class DatingProfileInfoRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(datingProfileInfo: DatingProfileInfo): DatingProfileInfo =
            template.insert<DatingProfileInfo>().usingAndAwait(datingProfileInfo)

    suspend fun find(profileId: UUID): DatingProfileInfo? =
            template.select<DatingProfileInfo>().matching(Query.query(Criteria.where("profile_id").`is`(profileId)))
                    .awaitFirstOrNull()

    suspend fun update(updated: DatingProfileInfo) =
            template.update<DatingProfileInfo>()
                    .matching(Query.query(Criteria.where("profile_id").`is`(updated.profileId)))
                    .apply(Update.update("goal", updated.goal)
                            .set("appearance_type", updated.appearanceType)
                            .set("natural_hair_color", updated.naturalHairColor)
                            .set("eye_color", updated.eyeColor)
                    ).awaitSingle()

    suspend fun delete(profileId: UUID) =
            template.delete<DatingProfileInfo>().matching(Query.query(Criteria.where("profile_id").`is`(profileId))).allAndAwait()
}