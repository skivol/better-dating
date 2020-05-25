package ua.betterdating.backend

import io.mockk.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.r2dbc.connectionfactory.R2dbcTransactionManager
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody
import org.springframework.transaction.ReactiveTransaction
import reactor.core.publisher.Mono
import reactor.core.publisher.Mono.just
import java.time.LocalDate
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
        coEvery { emailRepository.findByEmail(any()) } returns null

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
                    assertThat(actualError?.status).isEqualTo(422)
                    assertThat(actualError?.error).isEqualTo("Unprocessable Entity")
                    assertThat(actualError?.message).isEqualTo("Validation error")
                    assertThat(actualError?.details).isEqualTo(mapOf("email" to "Must be a valid email address"))
                }
    }

    @Test
    fun `Email submit already existing`() {
        givenErrorOnEmailInsert()
        // When
        client.post().uri("/api/user/profile")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(createProfileRequest("existing@test.com"))
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

    private fun createProfileRequest(email: String): CreateProfileRequest {
        return CreateProfileRequest(
                acceptTerms = true, email = email, gender = Gender.male,
                birthday = LocalDate.now().minusYears(21), height = 180f, weight = 70f,
                physicalExercise = Recurrence.everyDay, smoking = Recurrence.didBeforeNotGoingInFuture,
                alcohol = Recurrence.didBeforeNotGoingInFuture, computerGames = Recurrence.coupleTimesInYearOrMoreSeldom,
                gambling = Recurrence.neverDid, haircut = Recurrence.coupleTimesInYear, hairColoring = Recurrence.neverDid,
                makeup = Recurrence.neverDid, intimateRelationsOutsideOfMarriage = Recurrence.neverDid, pornographyWatching = Recurrence.didBeforeNotGoingInFuture,
                personalHealthEvaluation = 8
        )
    }

    @Test
    fun `Email verify`() {
        val email = givenExistingEmail()
        val actualEmailSlot = slot<Email>() // https://mockk.io/#capturing
        coEvery { emailRepository.update(capture(actualEmailSlot)) } returns 1
        val token = UUID.randomUUID()
        val existingToken = givenExistingToken(token, email)
        coEvery { emailVerificationTokenRepository.delete(any<EmailVerificationToken>()) } returns 1
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
                    coVerify { emailVerificationTokenRepository.delete(existingToken) }
                    coVerify { emailRepository.update(email) }
                }
    }

    @AfterAll
    fun tearDown() {
        configurableApplicationContext.close()
    }

    private fun givenExistingEmail(): Email {
        // Given
        val email = Email(email = "existing@test.com", verified = false)
        coEvery { emailRepository.findByEmail("existing@test.com") } returns email
        coEvery { emailRepository.findById(any()) } returns email
        return email
    }

    private fun givenErrorOnEmailInsert() {
        coEvery { emailRepository.save(any()) } throws DataIntegrityViolationException("duplicate key value violates unique constraint \"email_uk_email\"")
    }

    private fun givenExistingToken(id: UUID, email: Email): EmailVerificationToken {
        // Given
        val token = EmailVerificationToken(id = id, emailId = email.id, expires = LocalDateTime.now().plusMinutes(5))
        coEvery { emailVerificationTokenRepository.findById(eq(id)) } returns token
        return token
    }
}
