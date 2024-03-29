package ua.betterdating.backend

import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.MediaType
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody
import org.springframework.transaction.reactive.TransactionalOperator
import ua.betterdating.backend.data.*
import java.time.Instant
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.*

// https://mockk.io
class BackendApplicationTests {
    private val databaseClient = mockk<DatabaseClient>()
    private val transactionalOperator = mockk<TransactionalOperator>()
    private val emailRepository = mockk<EmailRepository>()
    private val emailVerificationTokenRepository = mockk<ExpiringTokenRepository>()
    private val smotrinyMailSender = mockk<SmotrinyMailSenderImpl>()

    private lateinit var configurableApplicationContext: ConfigurableApplicationContext
    private lateinit var client: WebTestClient

    @BeforeAll
    fun setup() {
        app.customize {
            beans {
                bean { databaseClient }
                bean(isPrimary = true) { emailRepository }
                bean(isPrimary = true) { emailVerificationTokenRepository }
                bean(isPrimary = true) { transactionalOperator }
                bean(isPrimary = true) { smotrinyMailSender }
            }
        }
        configurableApplicationContext = app.run(profiles = "test")
        client = WebTestClient.bindToServer().baseUrl("http://127.0.0.1:8181").build()
    }

    // TODO fix tests
    // @Test
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
                acceptTerms = true, email = email, gender = Gender.Male, nickname = "skivol",
                birthday = LocalDate.now().minusYears(21), height = 180f, weight = 70f,
                physicalExercise = Recurrence.EveryDay, smoking = Recurrence.DidBeforeNotGoingInFuture,
                alcohol = Recurrence.DidBeforeNotGoingInFuture, computerGames = Recurrence.CoupleTimesInYearOrMoreSeldom,
                gambling = Recurrence.NeverDidAndNotGoingInFuture, haircut = Recurrence.CoupleTimesInYear, hairColoring = Recurrence.NeverDidAndNotGoingInFuture,
                makeup = Recurrence.NeverDidAndNotGoingInFuture, intimateRelationsOutsideOfMarriage = Recurrence.NeverDidAndNotGoingInFuture, pornographyWatching = Recurrence.DidBeforeNotGoingInFuture,
                personalHealthEvaluation = 8
        )
    }

//    @Test
    fun `Email verify`() {
        val email = givenExistingEmail()
        val actualEmailSlot = slot<Email>() // https://mockk.io/#capturing
        coEvery { emailRepository.update(capture(actualEmailSlot)) } returns 1
        val tokenId = UUID.randomUUID()
        val existingToken = givenExistingToken(tokenId, email)
        coEvery { emailVerificationTokenRepository.delete(any()) } returns 1
        // When
        client.post().uri("/api/user/email/verify")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(Token(tokenId.toString()))
                .exchange()
                // Then
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectStatus().is2xxSuccessful
                .expectBody<ExpiringToken>()
                .consumeWith {
                    val actualResponse = it.responseBody
                    assertThat(actualResponse?.profileId).isEqualTo(email.id)
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

    private fun givenExistingToken(id: UUID, email: Email): ExpiringToken {
        // Given
        val token = ExpiringToken(type = TokenType.EMAIL_VERIFICATION, profileId = email.id, expires = Instant.now().plus(5, ChronoUnit.MINUTES), encodedValue = id.toString())
        coEvery { emailVerificationTokenRepository.findById(eq(id)) } returns token
        return token
    }
}
