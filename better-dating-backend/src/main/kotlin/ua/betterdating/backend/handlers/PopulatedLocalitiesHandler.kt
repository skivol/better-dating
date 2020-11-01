package ua.betterdating.backend.handlers

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import ua.betterdating.backend.PopulatedLocalitiesRepository

class PopulatedLocalitiesHandler(
        private val populatedLocalitiesRepository: PopulatedLocalitiesRepository
) {
    suspend fun autocomplete(request: ServerRequest): ServerResponse {
        val search = request.queryParam("q").orElse("")
        val result = populatedLocalitiesRepository.find(search).collectList().awaitFirst()
        return ok().json().bodyValueAndAwait(result)
    }
}