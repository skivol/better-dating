package ua.betterdating.backend

import com.fasterxml.jackson.core.JsonParseException
import com.fasterxml.jackson.databind.exc.InvalidFormatException
import com.fasterxml.jackson.module.kotlin.MissingKotlinParameterException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatus.*
import org.springframework.security.core.AuthenticationException
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import org.springframework.web.server.ServerWebInputException
import org.valiktor.ConstraintViolationException
import org.valiktor.i18n.mapToMessage
import ua.betterdating.backend.handlers.LatLng
import java.time.LocalDateTime

val LOG: Logger = LoggerFactory.getLogger(ErrorResponseEntity::class.java)
suspend fun mapErrorToResponse(e: Throwable, request: ServerRequest): ServerResponse {
    val errorEntity = when (e) {
        is EmailNotFoundException -> ErrorResponseEntity(request, NOT_FOUND, "No such email")
        is NoSuchTokenException -> ErrorResponseEntity(request, BAD_REQUEST, "No such token")
        is ExpiredTokenException -> ErrorResponseEntity(request, BAD_REQUEST, "Expired token")
        is InvalidTokenException -> ErrorResponseEntity(request, BAD_REQUEST, "Invalid token format")
        is DataIntegrityViolationException -> {
            when {
                e.message?.contains("duplicate key value violates unique constraint \"email_uk_email\"") == true -> {
                    ErrorResponseEntity(request, BAD_REQUEST, "Email already registered")
                }
                e.message?.contains("duplicate key value violates unique constraint \"profile_info_nickname_key\"") == true -> {
                    ErrorResponseEntity(request, BAD_REQUEST, "Nickname already registered")
                }
                else -> {
                    LOG.error("Unexpected database error", e)
                    ErrorResponseEntity(request, BAD_REQUEST, "Unknown error")
                }
            }
        }
        is ConstraintViolationException -> constraintViolationToResponse(
            e,
            request
        ) // on manual validation of, for example, email from query
        is ServerWebInputException -> {
            val firstCause = e.cause
            val secondCause = firstCause?.cause
            val thirdCause = secondCause?.cause

            when {
                // DecodingException -> ValueInstantiationException -> ConstraintViolationException (on valiktor validation failure while deserializing request body)
                thirdCause is ConstraintViolationException -> {
                    constraintViolationToResponse(thirdCause, request)
                }
                // DecodingException -> InvalidFormatException (on invalid enum/int value)
                secondCause is InvalidFormatException -> {
                    LOG.info("Deserialization error", secondCause)
                    ErrorResponseEntity(request, UNPROCESSABLE_ENTITY, secondCause.message ?: e.message)
                }
                // DecodingException -> MissingKotlinParameterException (when non-null value wasn't defined, hence - null)
                secondCause is MissingKotlinParameterException -> {
                    LOG.info("Deserialization error", firstCause)
                    ErrorResponseEntity(request, UNPROCESSABLE_ENTITY, secondCause.message ?: e.message)
                }
                // DecodingException -> JsonParseException (on invalid json)
                secondCause is JsonParseException -> {
                    LOG.info("Deserialization error", firstCause)
                    ErrorResponseEntity(request, UNPROCESSABLE_ENTITY, secondCause.message ?: e.message)
                }
                else -> {
                    ErrorResponseEntity(request, BAD_REQUEST, e.message)
                }
            }
        }
        is AuthenticationException -> ErrorResponseEntity(request, UNAUTHORIZED, UNAUTHORIZED.reasonPhrase)
        is AuthorNotFoundException -> ErrorResponseEntity(
            request,
            NOT_FOUND,
            "Author's profile was not found, try again later."
        )
        is NotEligibleForSecondStageException -> ErrorResponseEntity(
            request,
            BAD_REQUEST,
            "Not eligible for second stage"
        )
        is TooCloseToOtherPlacesException -> ErrorResponseEntity(
            request,
            BAD_REQUEST,
            "Too close to other existing points",
            mapOf("points" to e.points, "distance" to e.distance)
        )
        is NotInTargetPopulatedLocalityException -> ErrorResponseEntity(request, BAD_REQUEST, "Point doesn't seem to be in target populated locality", mapOf("locality" to e.placeName))
        else -> {
            LOG.error("Internal error", e)
            ErrorResponseEntity(request, INTERNAL_SERVER_ERROR, "Internal error")
        }
    }
    return ServerResponse.status(errorEntity.status).json().bodyValueAndAwait(errorEntity)
}

private fun constraintViolationToResponse(
    cause: ConstraintViolationException,
    request: ServerRequest
): ErrorResponseEntity {
    LOG.debug("Validation error", cause)
    return ErrorResponseEntity(
        request, UNPROCESSABLE_ENTITY,
        "Validation error",
        cause.constraintViolations.mapToMessage().associate { it.property to it.message }
    )
}

class ErrorResponseEntity(
    request: ServerRequest,
    status: HttpStatus,
    val message: String,
    val details: Map<String, Any> = emptyMap()
) {
    val path = request.path()
    val status = status.value()
    val error = status.reasonPhrase
    val timestamp: LocalDateTime = now()
}

class EmailNotFoundException : RuntimeException()
class NoSuchTokenException : RuntimeException()
class ExpiredTokenException : RuntimeException()
class InvalidTokenException : RuntimeException()

class EmailWasNotProvidedException : AuthenticationException("Email was not provided from user info endpoint")
class EmailNotRegisteredException(val email: String? = null) :
    AuthenticationException("Profile with this email is not registered")

class AuthorNotFoundException : RuntimeException()

class NotEligibleForSecondStageException : RuntimeException()

class TooCloseToOtherPlacesException(val points: List<LatLng>, val distance: Double) : RuntimeException()
class NotInTargetPopulatedLocalityException(val placeName: String) : RuntimeException()
