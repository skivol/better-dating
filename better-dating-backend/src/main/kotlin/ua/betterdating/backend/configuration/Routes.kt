package ua.betterdating.backend.configuration

import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.web.reactive.function.server.coRouter
import ua.betterdating.backend.handlers.*
import ua.betterdating.backend.mapErrorToResponse

fun routes(
        emailHandler: EmailHandler,
        userProfileHandler: UserProfileHandler,
        authHandler: AuthHandler,
        adminHandler: AdminHandler,
        healthHandler: HealthHandler
) = coRouter {
    "/api/user/email".nest {
        POST("/verify", accept(APPLICATION_JSON), emailHandler::verifyEmail)
        POST("/new-verification", accept(APPLICATION_JSON), emailHandler::triggerNewVerification)
        GET("/contact", emailHandler::mailTo)
    }

    "/api/user/profile".nest {
        POST("", accept(APPLICATION_JSON), userProfileHandler::createProfile)
        GET("", userProfileHandler::profile)
        PUT("", accept(APPLICATION_JSON), userProfileHandler::updateProfile)
        POST("/request-removal", accept(APPLICATION_JSON), userProfileHandler::requestRemoval)
        DELETE("", accept(APPLICATION_JSON), userProfileHandler::removeProfile)
        POST("/authors-profile", accept(APPLICATION_JSON), userProfileHandler::requestViewOfAuthorsProfile)
        GET("/view", userProfileHandler::viewOtherUserProfile)
    }

    "/api/admin".nest {
        GET("/usage-stats", adminHandler::usageStatistics)
        POST("/test-mail", accept(APPLICATION_JSON), adminHandler::sendTestMail)
    }

    GET("/api/support/csrf", authHandler::csrf)
    "/api/auth".nest {
        POST("/login-link", accept(APPLICATION_JSON), authHandler::sendLoginLink)
        POST("/login", accept(APPLICATION_JSON), authHandler::login)
        GET("/me", authHandler::currentUser)
    }

    GET("/actuator/health", healthHandler::healthStatus)

    onError<Throwable>(::mapErrorToResponse) // Note: "route doesn't exist" exception goes beyond this handler
}
