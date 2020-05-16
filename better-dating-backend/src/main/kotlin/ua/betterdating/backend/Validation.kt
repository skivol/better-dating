package ua.betterdating.backend

import am.ik.yavi.builder.ValidatorBuilder
import am.ik.yavi.builder.constraint
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.awaitBody

val emailValidator = ValidatorBuilder.of<EmailValue>()
        .constraint(EmailValue::email) {
            notNull()
                    .greaterThanOrEqual(5)
                    .lessThanOrEqual(50)
                    .email()
        }.build()

suspend fun withValidEmail(
        request: ServerRequest, email: String?, processValidEmail: suspend (String) -> ServerResponse
): ServerResponse {
    val validateResult = emailValidator.validate(EmailValue(email))
    return if (validateResult.isValid) {
        processValidEmail(email!!)
    } else {
        mapErrorToResponse(ValidationException(validateResult), request)
    }
}

val verifyEmailRequestValidator = ValidatorBuilder.of<VerifyEmailRequest>()
        .constraint(VerifyEmailRequest::token) { notNull() }.build()

suspend fun withValidVerifyEmailRequest(
        request: ServerRequest, processValidRequest: suspend (VerifyEmailRequest) -> ServerResponse
): ServerResponse {
    val verifyEmailRequest = request.awaitBody<VerifyEmailRequest>()
    val validateResult = verifyEmailRequestValidator.validate(verifyEmailRequest)
    return if (validateResult.isValid) {
        processValidRequest(verifyEmailRequest)
    } else {
        mapErrorToResponse(ValidationException(validateResult), request)
    }
}
