package ua.betterdating.backend

import java.util.UUID
import org.springframework.data.repository.CrudRepository

// https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/CrudRepository.html

interface EmailRepository : CrudRepository<Email, UUID> {
  fun findByEmail(email: String): Email?
}

interface EmailVerificationTokenRepository : CrudRepository<EmailVerificationToken, UUID> {
  fun findByEmail(email: Email): EmailVerificationToken?
}
