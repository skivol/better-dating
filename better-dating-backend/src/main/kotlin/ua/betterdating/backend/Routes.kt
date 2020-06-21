package ua.betterdating.backend

import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.web.reactive.function.server.coRouter
import ua.betterdating.backend.handlers.EmailHandler
import ua.betterdating.backend.handlers.HealthHandler
import ua.betterdating.backend.handlers.AuthHandler
import ua.betterdating.backend.handlers.UserProfileHandler

fun routes(
        emailHandler: EmailHandler,
        userProfileHandler: UserProfileHandler,
        authHandler: AuthHandler,
        healthHandler: HealthHandler
) = coRouter {
    "/api/user/email".nest {
        POST("/verify", accept(APPLICATION_JSON), emailHandler::verifyEmail)
        POST("/new-verification", accept(APPLICATION_JSON), emailHandler::triggerNewVerification)
        GET("/contact", emailHandler::mailTo)
    }

    "/api/user/profile".nest {
        POST("/", accept(APPLICATION_JSON), userProfileHandler::createProfile)
        GET("/", userProfileHandler::profile)
        PUT("/", accept(APPLICATION_JSON), userProfileHandler::updateProfile)
    }

    GET("/api/support/csrf", authHandler::csrf)
    "/api/auth".nest {
        POST("/login-link", accept(APPLICATION_JSON), authHandler::sendLoginLink)
        POST("/login", accept(APPLICATION_JSON), authHandler::login)
    }

    GET("/actuator/health", healthHandler::healthStatus)

    onError<Throwable>(::mapErrorToResponse) // Note: "route doesn't exist" exception goes beyond this handler
}
