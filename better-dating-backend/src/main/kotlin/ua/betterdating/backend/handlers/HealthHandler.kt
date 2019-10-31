package ua.betterdating.backend.handlers

import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.json

@Suppress("UNUSED_PARAMETER")
class HealthHandler {
    fun healthStatus(request: ServerRequest) = ok().json().bodyValue(HealthStatus())
}

data class HealthStatus(val status: String = "OK")

