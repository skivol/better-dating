package ua.betterdating.backend.handlers

import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import ua.betterdating.backend.*
import ua.betterdating.backend.data.EmailRepository
import ua.betterdating.backend.data.StatisticsRepository
import ua.betterdating.backend.utils.okEmptyJsonObject

class AdminHandler(
        private val statisticsRepository: StatisticsRepository,
        private val emailRepository: EmailRepository,
        private val freemarkerMailSender: FreemarkerMailSender
) {
    suspend fun usageStatistics(request: ServerRequest): ServerResponse {
        val registered = statisticsRepository.registered()
        val removed = statisticsRepository.removed()
        return ok().json().bodyValueAndAwait(UsageStats(registered, removed))
    }

    suspend fun sendTestMail(request: ServerRequest): ServerResponse {
        val currentUserEmail = currentUserEmail(emailRepository, request)
        freemarkerMailSender.sendTestMail(currentUserEmail.email)
        return okEmptyJsonObject()
    }
}