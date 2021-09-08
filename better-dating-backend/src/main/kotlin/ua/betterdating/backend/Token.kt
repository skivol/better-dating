package ua.betterdating.backend

import kotlinx.coroutines.delay
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import ua.betterdating.backend.data.ExpiringToken
import ua.betterdating.backend.data.TokenType
import java.security.SecureRandom
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*

// Tokens handling
fun encodeToken(tokenId: UUID, tokenValue: String) = base64("$tokenId:$tokenValue".toByteArray())

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

class DecodedToken(val id: UUID, val tokenValue: String)

suspend fun ExpiringToken.verify(userProvidedValue: String, type: TokenType, passwordEncoder: PasswordEncoder) {
    if (this.type !== type) throwBadCredentials()
    if (expired()) throw ExpiredTokenException()
    if (!passwordEncoder.matches(userProvidedValue, encodedValue)) throwBadCredentials()
}

suspend fun throwBadCredentials(): Nothing {
    randomDelay(500, 4_000)
    throw BadCredentialsException("1000")
}

suspend fun throwNoSuchToken(): Nothing {
    randomDelay(500, 4_000)
    throw NoSuchTokenException()
}

val lazyRandom by lazy { SecureRandom() }

fun base64(byteArray: ByteArray): String = Base64.getUrlEncoder().withoutPadding().encodeToString(byteArray)
fun decodeBase64(value: String): ByteArray = Base64.getUrlDecoder().decode(value)
fun generateUrlSafeToken(): String {
    val bytes = ByteArray(32)
    lazyRandom.nextBytes(bytes)
    return base64(bytes)
}

suspend fun randomDelay(min: Long, maxExtra: Int) = delay(min + lazyRandom.nextInt(maxExtra))

fun expiresValue(): Instant = Instant.now().plus(1, ChronoUnit.DAYS)
fun ExpiringToken.expired() = expires.isBefore(Instant.now())
