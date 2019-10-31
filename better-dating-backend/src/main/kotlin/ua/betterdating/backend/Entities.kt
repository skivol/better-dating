package ua.betterdating.backend

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
