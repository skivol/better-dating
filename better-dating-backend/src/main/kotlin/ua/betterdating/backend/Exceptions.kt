package ua.betterdating.backend

import com.fasterxml.jackson.annotation.JsonRootName
import java.lang.IllegalArgumentException
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.Response
import javax.ws.rs.core.Response.Status.BAD_REQUEST
import javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR
import javax.ws.rs.ext.ExceptionMapper
import javax.ws.rs.ext.Provider

// https://devs4j.com/2017/09/11/spring-boot-rest-error-handling/
// https://memorynotfound.com/generic-rest-service-jersey-error-handling/ ?
// http://jersey.576304.n2.nabble.com/How-to-catch-the-response-in-case-of-an-invalid-query-paramter-td6272285.html
@Provider
class ExceptionMapper : ExceptionMapper<Throwable> {
	override fun toResponse(e: Throwable): Response {
		val errorEntity = when(e) {
			is EmailAlreadyPresentException -> ErrorResponseEntity(BAD_REQUEST, "Email already registered")
			is EmailNotFoundException -> ErrorResponseEntity(BAD_REQUEST, "Email not found")
			is NoSuchTokenException -> ErrorResponseEntity(BAD_REQUEST, "No such token")
			is ExpiredTokenException -> ErrorResponseEntity(BAD_REQUEST, "Expired token")
			is InvalidTokenException -> ErrorResponseEntity(BAD_REQUEST, "Invalid token format")
			else -> ErrorResponseEntity(INTERNAL_SERVER_ERROR, "Internal error");
		};
		return createResponse(errorEntity)
	}

	private fun createResponse(error: ErrorResponseEntity): Response {
		return Response.status(error.statusCode).entity(error).type(MediaType.APPLICATION_JSON).build()
	}
}

class ErrorResponseEntity(val statusCode: Int, val statusDescription: String, val message: String) {
	constructor(status: Response.Status, message: String) : this(status.statusCode, status.toString(), message)
}

class EmailAlreadyPresentException(): RuntimeException()
class EmailNotFoundException(): RuntimeException()
class NoSuchTokenException : RuntimeException()
class ExpiredTokenException : RuntimeException()
class InvalidTokenException : RuntimeException()
