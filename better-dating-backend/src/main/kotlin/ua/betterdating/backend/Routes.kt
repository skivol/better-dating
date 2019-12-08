package ua.betterdating.backend

import org.springframework.http.MediaType
import org.springframework.web.reactive.function.server.coRouter
import ua.betterdating.backend.handlers.HealthHandler

fun routes(emailHandler: EmailHandler, healthHandler: HealthHandler) = coRouter {
    "/api/user/email".nest {
        GET("/status", emailHandler::emailStatus)
        POST("/submit", accept(MediaType.APPLICATION_JSON), emailHandler::submitEmail)
        POST("/verify", accept(MediaType.APPLICATION_JSON), emailHandler::verifyEmail)
        POST("/new-verification", accept(MediaType.APPLICATION_JSON), emailHandler::triggerNewVerification)
        GET("/contact", emailHandler::mailTo)
    }

    GET("/actuator/health", healthHandler::healthStatus)

    onError<Throwable>(::mapErrorToResponse)
}
