package ua.betterdating.backend.handlers

import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import ua.betterdating.backend.data.DatingPair
import ua.betterdating.backend.data.DatingPairWithNicknames
import ua.betterdating.backend.data.PairsRepository
import java.util.*

// class DateWithPerson(dateTime: LocalDateTime /*place */)
class DatingData(val pairs: List<DatingPairWithNicknames>/*, dates: List<DateWithPerson>*/)

class DatingHandler(
    private val pairsRepository: PairsRepository,
) {
    suspend fun datingData(request: ServerRequest): ServerResponse {
        val user = request.awaitPrincipal()
        val relevantPairs = pairsRepository.findRelevantPairs(UUID.fromString(user!!.name)).onEach { hideSnapshots(it.datingPair) }
        return ok().json().bodyValueAndAwait(DatingData(relevantPairs))
    }

    private fun hideSnapshots(datingPair: DatingPair) {
        datingPair.firstProfileSnapshot = null
        datingPair.secondProfileSnapshot = null
    }
}