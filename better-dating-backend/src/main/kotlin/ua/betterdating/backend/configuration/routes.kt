package ua.betterdating.backend.configuration

import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.web.reactive.function.server.coRouter
import ua.betterdating.backend.handlers.*
import ua.betterdating.backend.mapErrorToResponse

fun routes(
        emailHandler: EmailHandler,
        userProfileHandler: UserProfileHandler,
        datingHandler: DatingHandler,
        populatedLocalitiesHandler: PopulatedLocalitiesHandler,
        languagesHandler: LanguagesHandler,
        interestsHandler: InterestsHandler,
        personalQualitiesHandler: PersonalQualitiesHandler,
        authHandler: AuthHandler,
        adminHandler: AdminHandler,
        healthHandler: HealthHandler,
        placeHandler: PlaceHandler,
        pairHandler: PairHandler,
        historyHandler: HistoryHandler,
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
        POST("/user-profile", accept(APPLICATION_JSON), userProfileHandler::requestViewOfOtherUserProfile)
        POST("/view", accept(APPLICATION_JSON), userProfileHandler::viewOtherUserProfile)
        POST("/new-view-user-profile", accept(APPLICATION_JSON), userProfileHandler::newViewOtherUserProfile)
        POST("/activate-second-stage", accept(APPLICATION_JSON), userProfileHandler::activateSecondStage)
    }

    "/api/user/dating".nest {
        GET("", datingHandler::datingData)
        POST("check-in", datingHandler::checkIn)
        POST("verify-date", datingHandler::verifyDate)
        POST("evaluate-profile", datingHandler::evaluateProfile)
        POST("reschedule-date", datingHandler::rescheduleDate)
        POST("cancel-date", datingHandler::cancelDate)
    }

    "/api/user/pairs".nest {
        POST("decision", pairHandler::pairDecision)
    }

    "/api/place".nest {
        GET("/resolve-coordinates", placeHandler::resolvePopulatedLocalityCoordinatesForDate)
        POST("/add", placeHandler::addPlace)
        GET("", placeHandler::getPlaceData)
        POST("/approve", placeHandler::approvePlace)
    }

    GET("/api/populated-localities/autocomplete", populatedLocalitiesHandler::autocomplete)
    GET("/api/languages/autocomplete", languagesHandler::autocomplete)
    GET("/api/interests/autocomplete", interestsHandler::autocomplete)
    GET("/api/personal-qualities/autocomplete", personalQualitiesHandler::autocomplete)

    "/api/history".nest {
        GET("", historyHandler::get)
        GET("/nicknames", historyHandler::relevantNicknames)
    }

    GET("/api/users/autocomplete", historyHandler::usersAutocomplete)

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
