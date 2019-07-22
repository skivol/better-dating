package ua.betterdating.backend

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager


@DataJpaTest
class RepositoriesTests @Autowired constructor(
	val entityManager: TestEntityManager,
	val emailRepository: EmailRepository) {

	@Test
	fun `Check "findByEmail" in email repository`() {
		val testEmail = Email(email = "test@test.com", verified = false)
		entityManager.persist(testEmail)
		entityManager.flush()
		val found = emailRepository.findByEmail(testEmail.email)
		assertThat(found).isEqualTo(testEmail)
		assertThat(found?.id).isNotNull()
	}

	@Test
	fun `Check "save" in email repository`() {
		val testEmail = Email(email = "test@test.com", verified = false)
		emailRepository.save(testEmail)
		val found = emailRepository.findByEmail(testEmail.email)
		assertThat(found).isEqualTo(testEmail)
		assertThat(found?.id).isNotNull()
	}
}
