package ua.betterdating.backend

import com.fasterxml.jackson.core.JsonParseException
import com.fasterxml.jackson.databind.exc.InvalidFormatException
import com.fasterxml.jackson.module.kotlin.MissingKotlinParameterException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatus.*
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.AuthenticationException
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import org.springframework.web.server.ServerWebInputException
import org.valiktor.ConstraintViolationException
import org.valiktor.i18n.mapToMessage
import java.time.LocalDateTime
import java.time.ZoneOffset

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
        is ConstraintViolationException -> constraintViolationToResponse(e, request) // on manual validation of, for example, email from query
        is ServerWebInputException -> {
            val firstCause = e.cause
            val secondCause = firstCause?.cause
            val thirdCause = secondCause?.cause

            // DecodingException -> ValueInstantiationException -> ConstraintViolationException (on valiktor validation failure while deserializing request body)
            if (thirdCause is ConstraintViolationException) {
                constraintViolationToResponse(thirdCause, request)
                // DecodingException -> InvalidFormatException (on invalid enum/int value)
            } else if (secondCause is InvalidFormatException) {
                LOG.info("Deserialization error", secondCause)
                ErrorResponseEntity(request, UNPROCESSABLE_ENTITY, secondCause.message ?: e.message)
                // DecodingException -> MissingKotlinParameterException (when non-null value wasn't defined, hence - null)
            } else if (secondCause is MissingKotlinParameterException) {
                LOG.info("Deserialization error", firstCause)
                ErrorResponseEntity(request, UNPROCESSABLE_ENTITY, secondCause.message ?: e.message)
                // DecodingException -> JsonParseException (on invalid json)
            } else if (secondCause is JsonParseException) {
                LOG.info("Deserialization error", firstCause)
                ErrorResponseEntity(request, UNPROCESSABLE_ENTITY, secondCause.message ?: e.message)
            } else {
                ErrorResponseEntity(request, BAD_REQUEST, e.message)
            }
        }
        is AuthenticationException -> ErrorResponseEntity(request, UNAUTHORIZED, UNAUTHORIZED.reasonPhrase)
        is AuthorNotFoundException -> ErrorResponseEntity(request, NOT_FOUND, "Author's profile was not found, try again later.")
        else -> {
            LOG.error("Internal error", e)
            ErrorResponseEntity(request, INTERNAL_SERVER_ERROR, "Internal error")
        }
    }
    return ServerResponse.status(errorEntity.status).json().bodyValueAndAwait(errorEntity)
}

private fun constraintViolationToResponse(thirdCause: ConstraintViolationException, request: ServerRequest): ErrorResponseEntity {
    LOG.info("Validation error", thirdCause)
    return ErrorResponseEntity(
            path = request.path(), status = UNPROCESSABLE_ENTITY.value(),
            error = UNPROCESSABLE_ENTITY.reasonPhrase, message = "Validation error",
            details = thirdCause.constraintViolations.mapToMessage().map { it.property to it.message }.toMap()
    )
}

class ErrorResponseEntity(
        val timestamp: LocalDateTime = now(),
        val path: String,
        val status: Int, val error: String, val message: String, val details: Map<String, String> = emptyMap()
) {
    constructor(request: ServerRequest, status: HttpStatus, message: String) : this(
            path = request.path(), status = status.value(), error = status.reasonPhrase, message = message
    )
}

class EmailNotFoundException : RuntimeException()
class NoSuchTokenException : RuntimeException()
class ExpiredTokenException : RuntimeException()
class InvalidTokenException : RuntimeException()

class EmailWasNotProvidedException : AuthenticationException("Email was not provided from user info endpoint")
class EmailNotRegisteredException(val email: String? = null) : AuthenticationException("Profile with this email is not registered")

class AuthorNotFoundException : RuntimeException()
