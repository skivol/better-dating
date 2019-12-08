package ua.betterdating.backend

import kotlinx.coroutines.reactive.awaitFirst
import org.springframework.data.r2dbc.core.*
import org.springframework.data.r2dbc.query.Criteria.where
import java.util.*

class EmailRepository(private val client: DatabaseClient) { // TODO checkout ReactiveCrudRepository ? https://docs.spring.io/spring-data/r2dbc/docs/1.0.0.M2/reference/html/#r2dbc.repositories
  suspend fun findByEmail(email: String) = client.execute("SELECT * FROM email WHERE email = :email")
          .bind("email", email).asType<Email>().fetch().awaitOneOrNull()

  suspend fun save(email: Email) = client.insert().into<Email>().table("email").using(email).await()

  suspend fun findById(id: UUID) = client.execute("SELECT * FROM email WHERE id = :id")
          .bind("id", id).asType<Email>().fetch().awaitOne()

  suspend fun update(email: Email) =
          client.update().table("email").using( // TODO investigate other ways to formulate a query: https://docs.spring.io/spring-data/r2dbc/docs/1.0.0.M2/reference/html/#reference
              org.springframework.data.r2dbc.query.Update.update("verified", email.verified)
          ).matching(where("id").`is`(email.id)).fetch().rowsUpdated().awaitFirst()
}

class EmailVerificationTokenRepository(private val client: DatabaseClient) {
  suspend fun save(token: EmailVerificationToken) = client.insert().into<EmailVerificationToken>()
          .table("email_verification_token").using(token).await()

  suspend fun findById(id: UUID) =
          client.execute("SELECT * FROM email_verification_token AS evt WHERE evt.id = :id")
                  .bind("id", id).asType<EmailVerificationToken>().fetch().awaitOneOrNull()

  suspend fun delete(token: EmailVerificationToken) =
          client.delete().from("email_verification_token").matching(where("id").`is`(token.id)).fetch().rowsUpdated().awaitFirst()

  suspend fun delete(email: Email) =
          client.delete().from("email_verification_token").matching(where("email_id").`is`(email.id)).fetch().rowsUpdated().awaitFirst()
}
