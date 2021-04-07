package ua.betterdating.backend.data

import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.core.insert
import org.springframework.data.r2dbc.core.usingAndAwait
import ua.betterdating.backend.ProfileDeletionFeedback

class ProfileDeletionFeedbackRepository(private val template: R2dbcEntityTemplate) {
    suspend fun save(feedback: ProfileDeletionFeedback): ProfileDeletionFeedback = template.insert<ProfileDeletionFeedback>().usingAndAwait(feedback)
}