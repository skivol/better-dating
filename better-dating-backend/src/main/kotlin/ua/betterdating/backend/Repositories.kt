package ua.betterdating.backend

import org.springframework.data.r2dbc.core.DatabaseClient
import org.springframework.data.r2dbc.core.asType
import org.springframework.data.r2dbc.core.into
import org.springframework.data.r2dbc.query.Criteria.where
import java.util.*

class EmailRepository(private val client: DatabaseClient) { // TODO checkout ReactiveCrudRepository ? https://docs.spring.io/spring-data/r2dbc/docs/1.0.0.M2/reference/html/#r2dbc.repositories
  fun findByEmail(email: String) = client.execute("SELECT * FROM email WHERE email = :email")
          .bind("email", email).asType<Email>().fetch().one()

  fun save(email: Email) = client.insert().into<Email>().table("email").using(email).then()

  fun findById(id: UUID) = client.execute("SELECT * FROM email WHERE id = :id")
          .bind("id", id).asType<Email>().fetch().one()

  fun update(email: Email) =
          client.update().table("email").using( // TODO investigate other ways to formulate a query: https://docs.spring.io/spring-data/r2dbc/docs/1.0.0.M2/reference/html/#reference
              org.springframework.data.r2dbc.query.Update.update("verified", email.verified)
          ).matching(where("id").`is`(email.id)).fetch().rowsUpdated()
}

class EmailVerificationTokenRepository(private val client: DatabaseClient) {
  fun save(token: EmailVerificationToken) = client.insert().into<EmailVerificationToken>()
          .table("email_verification_token").using(token).then()

  fun findById(id: UUID) =
          client.execute("SELECT * FROM email_verification_token AS evt WHERE evt.id = :id")
                  .bind("id", id).asType<EmailVerificationToken>().fetch().one()

  fun delete(token: EmailVerificationToken) =
          client.delete().from("email_verification_token").matching(where("id").`is`(token.id)).fetch().rowsUpdated()

  fun delete(email: Email) =
          client.delete().from("email_verification_token").matching(where("email_id").`is`(email.id)).fetch().rowsUpdated()
}
