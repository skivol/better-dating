package ua.betterdating.backend

import org.springframework.http.MediaType
import org.springframework.web.reactive.function.server.coRouter
import ua.betterdating.backend.handlers.EmailHandler
import ua.betterdating.backend.handlers.HealthHandler
import ua.betterdating.backend.handlers.UserProfileHandler

fun routes(
        emailHandler: EmailHandler,
        userProfileHandler: UserProfileHandler,
        healthHandler: HealthHandler
) = coRouter {
    "/api/user/email".nest {
        GET("/status", emailHandler::emailStatus)
        POST("/verify", accept(MediaType.APPLICATION_JSON), emailHandler::verifyEmail)
        POST("/new-verification", accept(MediaType.APPLICATION_JSON), emailHandler::triggerNewVerification)
        GET("/contact", emailHandler::mailTo)
    }
    "/api/user/profile".nest {
        POST("/", accept(MediaType.APPLICATION_JSON), userProfileHandler::createProfile)
        GET("/{profileId}", userProfileHandler::profile)
        PUT("/{profileId}", accept(MediaType.APPLICATION_JSON), userProfileHandler::updateProfile)
    }

    GET("/actuator/health", healthHandler::healthStatus)

    onError<Throwable>(::mapErrorToResponse) // Note: "route doesn't exist" exception goes beyond this handler
}
