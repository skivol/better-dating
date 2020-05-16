package ua.betterdating.backend

import java.util.*

data class EmailValue(val email: String?)
data class EmailStatus(val used: Boolean)
data class SubmitEmailRequest(val email: String?)
data class VerifyEmailRequest(val token: String?)
data class ContactLink(val link: String)
data class VerifyLink(val verifyLink: String)

// https://docs.oracle.com/javase/8/docs/api/java/util/Base64.html
class Token(val id: UUID, val email: String) {
    fun base64Value(): String {
        return Base64.getUrlEncoder().encodeToString("$email:$id".toByteArray())
    }
}

fun parseToken(encodedToken: String): Token? {
    try {
        val decodedToken = String(Base64.getUrlDecoder().decode(encodedToken))
        val emailAndIdValues = decodedToken.split(":")
        return Token(id = UUID.fromString(emailAndIdValues[1]), email = emailAndIdValues[0])
    } catch (e: Exception) {
        return null
    }
}
