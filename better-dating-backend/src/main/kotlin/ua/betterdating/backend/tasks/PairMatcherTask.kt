package ua.betterdating.backend.tasks

import kotlinx.coroutines.launch
import kotlinx.coroutines.reactive.awaitLast
import kotlinx.coroutines.runBlocking
import org.springframework.scheduling.annotation.Scheduled
import reactor.core.publisher.Flux
import ua.betterdating.backend.*
import ua.betterdating.backend.Recurrence.*
import ua.betterdating.backend.data.PairsRepository
import ua.betterdating.backend.data.ProfileMatchInformation
import java.time.LocalDateTime

val abstaining = listOf(neverDidAndNotGoingInFuture, didBeforeNotGoingInFuture)
val undecided = listOf(neverDidButDoNotKnowIfGoingToDoInFuture, didBeforeButDoNotKnowIfGoingToDoInFuture)
val doing = listOf(coupleTimesInYearOrMoreSeldom, coupleTimesInYear, coupleTimesInMonth, coupleTimesInWeek, everyDay, severalTimesInDay)

class PairMatcherTask(
        private val pairsRepository: PairsRepository
) {
    @Scheduled(fixedRateString = "PT5m") // run every 5 minutes
    fun match() {
        runBlocking<Unit> { // https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html
            launch { // context of the parent, main runBlocking coroutine
                println("Matching pairs! :) at ${LocalDateTime.now()}")

                // users are processed in registration order
                val usersToFindMatchesFor: Flux<ProfileMatchInformation> = pairsRepository.usersToFindMatchesFor()
                usersToFindMatchesFor.map {
                    val lookingForCandidatesForMaleUser = it.gender == Gender.male
                    val candidateGender = if (lookingForCandidatesForMaleUser) Gender.female else Gender.male

                    // age - male either a bit younger than female (within 2 years)
                    val candidateBirthdayFrom = it.birthday.minusYears(
                            if (lookingForCandidatesForMaleUser) {
                                2
                            } else {
                                7
                            }
                    )
                    // or older (within 7 years)
                    val candidateBirthdayTo = it.birthday.plusYears(
                            if (lookingForCandidatesForMaleUser) {
                                7
                            } else {
                                2
                            }
                    )

                    // height - male either slightly (within 5 cm) lower or higher (within 25 cm)
                    val candidateHeightFrom = it.height - (if (lookingForCandidatesForMaleUser) 25 else 5)
                    val candidateHeightTo = it.height + (if (lookingForCandidatesForMaleUser) 5 else 25)

                    // smoking, alcohol, pornography watching, intimate relationships -
                    // both should have corresponding intentions (for example, both are not going to do these things in future, or going to continue doing it to some extent).
                    // In case of those who haven't decided yet - they can be matched with everybody.
                    val candidateSmoking = matchHabit(it.smoking)
                    val candidateAlcohol = matchHabit(it.alcohol)
                    val candidatePornographyWatching = matchHabit(it.pornographyWatching)
                    val candidateIntimateRelationsOutsideOfMarriage = matchHabit(it.intimateRelationsOutsideOfMarriage)

                    val candidates: Flux<ProfileMatchInformation> = pairsRepository.findCandidates(
                            // same weight category (bmi);
                            candidateGender, it.bmiCategory,
                            candidateBirthdayFrom, candidateBirthdayTo,
                            candidateHeightFrom, candidateHeightTo,
                            candidateSmoking, candidateAlcohol,
                            candidatePornographyWatching, candidateIntimateRelationsOutsideOfMarriage,
                            // same appearance type
                            it.appearanceType,
                            // either same city/town or one of participants is ready to travel to meet other person
                            it.populatedLocality.id,
                            // one native language(s) or readiness to learn native languages of each other
                            it.nativeLanguages
                    )
                    // TODO create a pair and track values
                }.awaitLast()

                println("Done!")
            }
        }

        // checkout Spring Batch ? (https://docs.spring.io/spring-batch/docs/current/reference/html/index.html)
    }

    private fun matchHabit(recurrence: Recurrence) =
            when {
                abstaining.contains(recurrence) -> abstaining + undecided
                undecided.contains(recurrence) -> abstaining + undecided + doing
                else -> undecided + doing
            }
}