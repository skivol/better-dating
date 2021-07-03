package ua.betterdating.backend.handlers

import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import ua.betterdating.backend.data.*
import java.util.*

class DatingData(val pairs: List<DatingPairWithNicknames>, val dates: List<DateInfoWithPlace>)

class DatingHandler(
    private val pairsRepository: PairsRepository,
    private val datesRepository: DatesRepository,
) {
    suspend fun datingData(request: ServerRequest): ServerResponse {
        val user = request.awaitPrincipal()
        val profileId = UUID.fromString(user!!.name)
        val relevantPairs = pairsRepository.findRelevantPairs(profileId).onEach { hideSnapshots(it.datingPair) }
        val relevantDates = datesRepository.findRelevantDates(profileId)
        return ok().json().bodyValueAndAwait(DatingData(relevantPairs, relevantDates))
    }

    private fun hideSnapshots(datingPair: DatingPair) {
        datingPair.firstProfileSnapshot = null
        datingPair.secondProfileSnapshot = null
    }
}