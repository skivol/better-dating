package ua.betterdating.backend

import org.springframework.data.annotation.Id
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

class Email(
        var email: String,
        var verified: Boolean,
        @Id var id: UUID = UUID.randomUUID()
)

class ExpiringToken(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val type: TokenType,
        val expires: LocalDateTime,
        val encodedValue: String
)

enum class TokenType {
    EMAIL_VERIFICATION,
    ONE_TIME_PASSWORD,
    ACCOUNT_REMOVAL
}

class AcceptedTerms(
        @Id val profileId: UUID,
        val lastDateAccepted: LocalDateTime
)

class ProfileInfo(
        @Id val profileId: UUID,
        val gender: Gender,
        val birthday: LocalDate,
        val createdAt: LocalDateTime?,
        val updatedAt: LocalDateTime?
)

class Height(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val date: LocalDateTime,
        val height: Float
)

class Weight(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val date: LocalDateTime,
        val weight: Float
)

class Activity(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val name: String,
        val date: LocalDateTime,
        val recurrence: Recurrence
)

class ProfileEvaluation(
        @Id val sourceProfileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val targetProfileId: UUID,
        val date: LocalDateTime,
        val evaluation: Int,
        val comment: String?
)

class EmailChangeHistory(
        @Id val id: Long,
        val profileId: UUID,
        val email: String,
        val changeOn: LocalDateTime
)

class ProfileDeletionFeedback(
        @Id val profileId: UUID,
        val reason: DeleteReason,
        val explanationComment: String
)
