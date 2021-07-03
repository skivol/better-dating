package ua.betterdating.backend.data

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.r2dbc.core.*
import org.springframework.data.relational.core.query.Criteria
import org.springframework.data.relational.core.query.Query
import java.util.*

class UserRoleRepository(templateSupplier: Lazy<R2dbcEntityTemplate>) {
    private val template by templateSupplier

    suspend fun save(userRole: UserRole): UserRole = template.insert<UserRole>().usingAndAwait(userRole)

    suspend fun findAll(profileId: UUID): List<UserRole> = findAllMono(profileId).awaitFirst()

    fun findAllMono(profileId: UUID) =
            template.select<UserRole>().matching(Query.query(Criteria.where("profile_id").`is`(profileId))).all().collectList()

    suspend fun delete(profileId: UUID) =
            template.delete<UserRole>().matching(Query.query(Criteria.where("profile_id").`is`(profileId))).allAndAwait()

    suspend fun findAdmin(): UserRole? =
            template.select<UserRole>().matching(Query.query(Criteria.where("role").`is`(Role.ROLE_ADMIN))).awaitFirstOrNull()
}