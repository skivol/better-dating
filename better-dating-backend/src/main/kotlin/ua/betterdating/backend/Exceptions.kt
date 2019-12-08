package ua.betterdating.backend

import am.ik.yavi.core.ConstraintViolations
import am.ik.yavi.core.ViolationDetail
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatus.BAD_REQUEST
import org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import reactor.core.publisher.Mono
import java.time.LocalDateTime
import java.time.ZoneOffset

val LOG: Logger = LoggerFactory.getLogger(ErrorResponseEntity::class.java)
suspend fun mapErrorToResponse(e: Throwable, request: ServerRequest): ServerResponse {
    val errorEntity = when (e) {
        is EmailAlreadyPresentException -> ErrorResponseEntity(request, BAD_REQUEST, "Email already registered")
        is EmailNotFoundException -> ErrorResponseEntity(request, BAD_REQUEST, "Email not found")
        is NoSuchTokenException -> ErrorResponseEntity(request, BAD_REQUEST, "No such token")
        is ExpiredTokenException -> ErrorResponseEntity(request, BAD_REQUEST, "Expired token")
        is InvalidTokenException -> ErrorResponseEntity(request, BAD_REQUEST, "Invalid token format")
        is ValidationException -> ErrorResponseEntity(
            path = request.path(), status = BAD_REQUEST.value(), error = BAD_REQUEST.reasonPhrase, message = "Validation exception", details =  e.violations.details().map { ValidationError(it) }
        )
        else -> {
            LOG.error("Internal error", e)
            ErrorResponseEntity(request, INTERNAL_SERVER_ERROR, "Internal error")
        }
    }
    return ServerResponse.status(errorEntity.status).json().bodyValueAndAwait(errorEntity)
}

class ErrorResponseEntity(
        val timestamp: LocalDateTime = LocalDateTime.now(ZoneOffset.UTC),
        val path: String,
        val status: Int, val error: String, val message: String, val details: List<ValidationError> = emptyList()
) {
    constructor(request: ServerRequest, status: HttpStatus, message: String) : this(
        path = request.path(), status = status.value(), error = status.reasonPhrase, message = message
    )
}

class ValidationError(val args: Array<Any> = emptyArray(), val defaultMessage: String = "", val key: String = "") {
    constructor(violationDetail: ViolationDetail): this(violationDetail.args, violationDetail.defaultMessage, violationDetail.key)

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ValidationError

        if (!args.contentEquals(other.args)) return false
        if (defaultMessage != other.defaultMessage) return false
        if (key != other.key) return false

        return true
    }

    override fun hashCode(): Int {
        var result = args.contentHashCode()
        result = 31 * result + defaultMessage.hashCode()
        result = 31 * result + key.hashCode()
        return result
    }
}

class ValidationException(val violations: ConstraintViolations) : RuntimeException()
class EmailAlreadyPresentException : RuntimeException()
class EmailNotFoundException : RuntimeException()
class NoSuchTokenException : RuntimeException()
class ExpiredTokenException : RuntimeException()
class InvalidTokenException : RuntimeException()
