package ua.betterdating.backend.handlers

import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import ua.betterdating.backend.data.History
import ua.betterdating.backend.data.HistoryRepository
import ua.betterdating.backend.data.HistoryType
import ua.betterdating.backend.data.ProfileInfoRepository
import java.util.*

class HistoryDto(history: History) {
    val id = history.id
    val profileId = history.profileId
    val type = history.type
    // com.fasterxml.jackson.databind.exc.InvalidDefinitionException: No serializer found for class io.r2dbc.postgresql.codec.Json$JsonByteArrayInput
    val payload = history.payload.asString()
    val timestamp = history.timestamp
}
class HistoryHandler(
    private val historyRepository: HistoryRepository,
    private val profileInfoRepository: ProfileInfoRepository,
) {
    suspend fun get(request: ServerRequest): ServerResponse {
        val type = when(val typeParam = request.queryParam("type").orElse("All")) {
            "All" -> null
            else -> HistoryType.valueOf(typeParam)
        }
        val principal = request.awaitPrincipal()!! as UsernamePasswordAuthenticationToken
        val isAdmin = principal.authorities.any { it.authority == "ROLE_ADMIN" }
        val userId = request.queryParam("userId").orElse("null").let { if (it == "null") null else it }
        val targetProfileId = if (isAdmin) userId?.let { UUID.fromString(it) } else UUID.fromString(principal.name)
        val types = (type?.let { listOf(it) } ?: HistoryType.values().filter {
            isAdmin || it != HistoryType.TooCloseToOtherPlacesExceptionHappened
        }.toList()).map { it.toString() }

        // allow fetching all history only for TooCloseToOtherPlacesExceptionHappened event type or only when targeting single user
        val fetchHistory = targetProfileId != null || type == HistoryType.TooCloseToOtherPlacesExceptionHappened
        val historyFlow = if (fetchHistory) historyRepository.get(
            targetProfileId,
            types
        ).map { HistoryDto(it) } else flow {}
        return ok().json().bodyAndAwait(historyFlow)
    }

    suspend fun relevantNicknames(request: ServerRequest): ServerResponse {
        val currentProfileId = UUID.fromString(request.awaitPrincipal()!!.name)
        val relevantNicknames: Map<UUID, String> = historyRepository.relevantNicknames(currentProfileId)
        return ok().json().bodyValueAndAwait(relevantNicknames)
    }

    suspend fun usersAutocomplete(request: ServerRequest): ServerResponse {
        val query = request.queryParam("q").orElse("").let { it.ifEmpty { null } }
        val users = query?.let { profileInfoRepository.usersAutocomplete(it) } ?: flow {}
        return ok().json().bodyAndAwait(users)
    }
}