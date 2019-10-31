package ua.betterdating.backend

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.data.r2dbc.connectionfactory.R2dbcTransactionManager
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody
import org.springframework.transaction.ReactiveTransaction
import reactor.core.publisher.Mono
import reactor.core.publisher.Mono.just
import java.time.LocalDateTime
import java.util.*

// https://mockk.io
class BackendApplicationTests {
    private val r2dbcTransactionManager = mockk<R2dbcTransactionManager>()
    private val emailRepository = mockk<EmailRepository>()
    private val emailVerificationTokenRepository = mockk<EmailVerificationTokenRepository>()
    private val smotrinyMailSender = mockk<SmotrinyMailSender>()

    private lateinit var configurableApplicationContext: ConfigurableApplicationContext
    private lateinit var client: WebTestClient

    @BeforeAll
    fun setup() {
        app.customize {
            beans {
                bean(isPrimary = true) { emailRepository }
                bean(isPrimary = true) { emailVerificationTokenRepository }
                bean(isPrimary = true) { r2dbcTransactionManager }
                bean(isPrimary = true) { smotrinyMailSender }
            }
        }
        configurableApplicationContext = app.run(profiles = "test")
        client = WebTestClient.bindToServer().baseUrl("http://127.0.0.1:8181").build()

        val reactiveTransaction = mockk<ReactiveTransaction>();
        every { r2dbcTransactionManager.getReactiveTransaction(any()) } returns just(reactiveTransaction)
        every { r2dbcTransactionManager.commit(any()) } returns Mono.empty()
        every { r2dbcTransactionManager.rollback(any()) } returns Mono.empty()
    }

    @Test
    fun `Email status check (already used)`() {
        // Given
        givenExistingEmail()
        // When
        client.get().uri("/api/user/email/status?email=existing@test.com")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                // Then
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectStatus().is2xxSuccessful
                .expectBody<EmailStatus>()
                .isEqualTo(EmailStatus(used = true))
    }

    @Test
    fun `Email status check (not used)`() {
        // Given
        every { emailRepository.findByEmail(any()) } returns Mono.empty()

        // When
        client.get().uri("/api/user/email/status?email=non_existing@test.com")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                // Then
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectStatus().is2xxSuccessful
                .expectBody<EmailStatus>()
                .isEqualTo(EmailStatus(used = false))
    }

    @Test
    fun `Email status check (malformed param)`() {
        // When
        client.get().uri("/api/user/email/status?email=malformed.com")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                // Then
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectStatus().is4xxClientError
                .expectBody<ErrorResponseEntity>()
                .consumeWith {
                    val actualError = it.responseBody
                    assertThat(actualError?.path).isEqualTo("/api/user/email/status")
                    assertThat(actualError?.status).isEqualTo(400)
                    assertThat(actualError?.error).isEqualTo("Bad Request")
                    assertThat(actualError?.message).isEqualTo("Validation exception")
                    assertThat(actualError?.details?.elementAt(0)).isEqualTo(
                        ValidationError(
                            args = arrayOf("email", "malformed.com"),
                            defaultMessage = "\"email\" must be a valid email address",
                            key = "charSequence.email"
                        )
                    )
                }
    }

    @Test
    fun `Email submit already existing`() {
        givenExistingEmail()
        // When
        client.post().uri("/api/user/email/submit")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(SubmitEmailRequest(email = "existing@test.com"))
                .exchange()
                // Then
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectStatus().is4xxClientError
                .expectBody<ErrorResponseEntity>()
                .consumeWith {
                    val actualResponse = it.responseBody
                    assertThat(actualResponse?.message).isEqualTo("Email already registered")
                }
    }

    @Test
    fun `Email verify`() {
        val email = givenExistingEmail()
        val actualEmailSlot = slot<Email>() // https://mockk.io/#capturing
        every { emailRepository.update(capture(actualEmailSlot)) } returns just(1)
        val token = UUID.randomUUID()
        val existingToken = givenExistingToken(token, email)
        every { emailVerificationTokenRepository.delete(any<EmailVerificationToken>()) } returns just(1)
        // When
        client.post().uri("/api/user/email/verify")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(VerifyEmailRequest(Token(token, email.email).base64Value()))
                .exchange()
                // Then
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectStatus().is2xxSuccessful
                .expectBody<EmailVerificationToken>()
                .consumeWith {
                    val actualResponse = it.responseBody
                    assertThat(actualResponse?.emailId).isEqualTo(email.id)
                    assertThat(actualEmailSlot.captured.verified).isTrue()
                    verify { emailVerificationTokenRepository.delete(existingToken) }
                    verify { emailRepository.update(email) }
                }
    }

    @AfterAll
    fun tearDown() {
        configurableApplicationContext.close()
    }

    private fun givenExistingEmail(): Email {
        // Given
        val email = Email(email = "existing@test.com", verified = false)
        every { emailRepository.findByEmail("existing@test.com") } returns just(email)
        every { emailRepository.findById(any()) } returns just(email)
        return email
    }

    private fun givenExistingToken(id: UUID, email: Email): EmailVerificationToken {
        // Given
        val token = EmailVerificationToken(id = id, emailId = email.id, expires = LocalDateTime.now().plusMinutes(5))
        every { emailVerificationTokenRepository.findById(eq(id)) } returns just(token)
        return token
    }
}
