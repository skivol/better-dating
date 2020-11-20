package ua.betterdating.backend.handlers

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import ua.betterdating.backend.LanguagesRepository

class LanguagesHandler(
        private val languagesRepository: LanguagesRepository
) {
    suspend fun autocomplete(request: ServerRequest): ServerResponse {
        val search = request.queryParam("q").orElse("")
        val result = languagesRepository.find(search).collectList().awaitFirst()
        return ServerResponse.ok().json().bodyValueAndAwait(result)
    }
}