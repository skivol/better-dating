package ua.betterdating.backend

import kotlinx.coroutines.delay
import java.security.SecureRandom
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

// Tokens handling
fun encodeToken(profileId: UUID, tokenValue: String) = base64("$profileId:$tokenValue".toByteArray())

class Token(val token: String) {
    fun decode(): DecodedToken {
        try {
            val parts = String(decodeBase64(token)).split(":")
            return DecodedToken(UUID.fromString(parts[0]), parts[1])
        } catch (e: Throwable) {
            throw InvalidTokenException()
        }
    }
}

class DecodedToken(val profileId: UUID, val tokenValue: String)

val lazyRandom by lazy { SecureRandom() }

fun base64(byteArray: ByteArray): String = Base64.getUrlEncoder().withoutPadding().encodeToString(byteArray)
fun decodeBase64(value: String): ByteArray = Base64.getUrlDecoder().decode(value)
fun generateUrlSafeToken(): String {
    val bytes = ByteArray(32)
    lazyRandom.nextBytes(bytes)
    return base64(bytes)
}

suspend fun randomDelay(min: Long, maxExtra: Int) = delay(min + lazyRandom.nextInt(maxExtra))

fun now(): LocalDateTime = LocalDateTime.now(ZoneOffset.UTC)
fun expiresValue(): LocalDateTime = now().plusDays(1)
fun ExpiringToken.expired() = expires.isBefore(now())
