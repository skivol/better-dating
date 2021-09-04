package ua.betterdating.backend.tasks

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import ua.betterdating.backend.data.DatesRepository
import ua.betterdating.backend.data.ExpiringTokenRepository
import ua.betterdating.backend.utils.LoggerDelegate

class OverdueDateHandlerTask(
    private val datesRepository: DatesRepository,
    private val expiringTokenRepository: ExpiringTokenRepository,
    private val transactionalOperator: TransactionalOperator,
): CancellableTask() {
    private val log by LoggerDelegate()

    @Suppress("unused")
    @Scheduled(fixedDelayString = "PT12h") // run couple times a day
    fun markOverdueDates() {
        runTask {
            doMarkOverdueDates()
        }
    }

    private suspend fun doMarkOverdueDates() {
        log.debug("Marking dates as overdue!")
        transactionalOperator.executeAndAwait {
            val datesMarked = datesRepository.markScheduledButNotVerifiedDatesAsOverdue(7)
            if (datesMarked.isNotEmpty()) {
                // cleanup relevant verification tokens
                expiringTokenRepository.deleteByDateIds(datesMarked)
                log.debug("Marked {} date(s) as overdue while removing their verification tokens as well.", datesMarked.size)
            }
        }
        log.debug("Done!")
    }
}