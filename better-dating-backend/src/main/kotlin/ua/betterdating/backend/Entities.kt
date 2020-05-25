package ua.betterdating.backend

import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

class Email(
        var email: String,
        var verified: Boolean,
        var id: UUID = UUID.randomUUID()
)

class EmailVerificationToken(
        var emailId: UUID,
        var expires: LocalDateTime,
        var id: UUID = UUID.randomUUID()
)

class AcceptedTerms(
        val profileId: UUID,
        val lastDateAccepted: LocalDateTime
)

class ProfileInfo(
        val profileId: UUID,
        val gender: Gender,
        val birthday: LocalDate,
        val createdAt: LocalDateTime?,
        val updatedAt: LocalDateTime?
)

class Height(
        val profileId: UUID,
        val date: LocalDateTime,
        val height: Float
)

class Weight(
        val profileId: UUID,
        val date: LocalDateTime,
        val weight: Float
)

class Activity(
        val profileId: UUID,
        val name: String,
        val date: LocalDateTime,
        val recurrence: Recurrence
)

class ProfileEvaluation(
        val sourceProfileId: UUID,
        val targetProfileId: UUID,
        val date: LocalDateTime,
        val evaluation: Int,
        val comment: String?
)
