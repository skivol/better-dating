package ua.betterdating.backend

import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.boot.test.web.client.getForEntity
import org.springframework.http.HttpStatus
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import java.time.LocalDateTime
import java.util.*

// https://mockk.io
@ContextConfiguration
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BackendApplicationTests(@Autowired val restTemplate: TestRestTemplate) {
	@MockkBean
	private lateinit var emailRepository: EmailRepository
	@MockkBean
	private lateinit var emailVerificationTokenRepository: EmailVerificationTokenRepository
	@MockkBean
	private lateinit var smotrinyMailSender: SmotrinyMailSender

	@BeforeAll
	fun setup() {
		println(">> Setup")
	}
  
	@Test
	fun `Email status check (already used)`() {
		givenExistingEmail()

		// When
		// TODO extract call to helper fun
		val entity = restTemplate.getForEntity<String>("/api/user/email/status?email=existing@test.com")

		// Then
		assertThat(entity.statusCode).isEqualTo(HttpStatus.OK)
		assertThat(entity.body).contains("\"used\":true")
	}

	@Test
	fun `Email status check (not used)`() {
		// Given
		every { emailRepository.findByEmail(any()) } returns null

		// When
		val entity = restTemplate.getForEntity<String>("/api/user/email/status?email=non_existing@test.com")

		// Then
		assertThat(entity.statusCode).isEqualTo(HttpStatus.OK)
		assertThat(entity.body).contains("\"used\":false")
	}

	@Test
	fun `Email status check (malformed param)`() {
		// When
		val entity = restTemplate.getForEntity<String>("/api/user/email/status?email=malformed.com")

		// Then
		assertThat(entity.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
		// TODO return json with error description
		assertThat(entity.body).contains("\"status\":400,\"error\":\"Bad Request\"")
	}

	@Test
	fun `Email submit already existing`() {
		givenExistingEmail()

		// When
		val entity = restTemplate.postForEntity<String>("/api/user/email/submit", SubmitEmailRequest(email = "existing@test.com"), String::class.java)

		// Then
		assertThat(entity.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
		assertThat(entity.body).contains("\"message\":\"Email already registered\"")
		assertThat(entity.body).contains("\"statusCode\":400")
	}

	@Test
	fun `Email verify`() {
		val email = givenExistingEmail()
		mockSaveEmail(email)
		val token = UUID.randomUUID()
		givenExistingToken(token, email)

		// When
		val entity = restTemplate.postForEntity<String>("/api/user/email/verify", VerifyEmailRequest(Token(token, email.email).base64Value()), String::class.java)

		// Then
		assertThat(entity.statusCode).isEqualTo(HttpStatus.OK)
		// TODO verify that email.verified was "true" in email "save" call
		verify { emailVerificationTokenRepository.delete(any()) }
	}

	@AfterAll
	fun tearDown() {
		println(">> Tear down")
	}

	fun givenExistingEmail(): Email {
		// Given
		val email = Email(email = "existing@test.com", verified = false)
		every { emailRepository.findByEmail("existing@test.com") } returns email
		return email
	}

	fun givenExistingToken(id: UUID, email: Email) {
		// Given
		val token = EmailVerificationToken(id = id, email = email, expires = LocalDateTime.now().plusMinutes(5))
		every { emailVerificationTokenRepository.findById(eq(id)) } returns Optional.of(token)
	}

	fun mockSaveEmail(email: Email) {
		every { emailRepository.save(email) } answers { arg(0) }
	}
}
