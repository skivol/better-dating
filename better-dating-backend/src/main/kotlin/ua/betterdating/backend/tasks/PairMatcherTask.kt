package ua.betterdating.backend.tasks

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.reactive.asFlow
import kotlinx.coroutines.runBlocking
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import ua.betterdating.backend.DatingGoal
import ua.betterdating.backend.Gender
import ua.betterdating.backend.Recurrence
import ua.betterdating.backend.Recurrence.*
import ua.betterdating.backend.data.DatingPair
import ua.betterdating.backend.data.DatingPairLock
import ua.betterdating.backend.data.PairsRepository
import ua.betterdating.backend.data.ProfileMatchInformation
import java.lang.RuntimeException
import java.time.LocalDateTime

val abstaining = listOf(neverDidAndNotGoingInFuture, didBeforeNotGoingInFuture)
val undecided = listOf(neverDidButDoNotKnowIfGoingToDoInFuture, didBeforeButDoNotKnowIfGoingToDoInFuture)
val doing = listOf(coupleTimesInYearOrMoreSeldom, coupleTimesInYear, coupleTimesInMonth, coupleTimesInWeek, everyDay, severalTimesInDay)

class PairMatcherTask(
    private val pairsRepository: PairsRepository,
    private val transactionalOperator: TransactionalOperator,
) {

    @Scheduled(fixedRateString = "PT5m") // run every 5 minutes
    fun match() {
        runBlocking<Unit> { // https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html
            launch { // context of the parent, main runBlocking coroutine
                doMatching()
            }
        }

        // checkout Spring Batch ? (https://docs.spring.io/spring-batch/docs/current/reference/html/index.html)
    }

    private suspend fun doMatching() {
        println("Matching pairs! :) at ${LocalDateTime.now()}")

        // users are processed in registration order
        pairsRepository.usersToFindMatchesFor()
            .asFlow()
            .flatMapConcat(this::findMatches)
            .collect {}

        println("Done!")
    }

    private fun findMatches(targetProfile: ProfileMatchInformation): Flow<DatingPair> {
        val lookingForCandidatesForMaleUser = targetProfile.gender == Gender.male
        val candidateGender = if (lookingForCandidatesForMaleUser) Gender.female else Gender.male

        // age - male either a bit younger than female (within 2 years)
        val candidateBirthdayFrom = targetProfile.birthday.minusYears(
            if (lookingForCandidatesForMaleUser) {
                2
            } else {
                7
            }
        )
        // or older (within 7 years)
        val candidateBirthdayTo = targetProfile.birthday.plusYears(
            if (lookingForCandidatesForMaleUser) {
                7
            } else {
                2
            }
        )

        // height - male either slightly (within 5 cm) lower or higher (within 25 cm)
        val candidateHeightFrom = targetProfile.height - (if (lookingForCandidatesForMaleUser) 25 else 5)
        val candidateHeightTo = targetProfile.height + (if (lookingForCandidatesForMaleUser) 5 else 25)

        // smoking, alcohol, pornography watching, intimate relationships -
        // both should have corresponding intentions (for example, both are not going to do these things in future, or going to continue doing it to some extent).
        // In case of those who haven't decided yet - they can be matched with everybody.
        val candidateSmoking = matchHabit(targetProfile.smoking)
        val candidateAlcohol = matchHabit(targetProfile.alcohol)
        val candidatePornographyWatching = matchHabit(targetProfile.pornographyWatching)
        val candidateIntimateRelationsOutsideOfMarriage = matchHabit(targetProfile.intimateRelationsOutsideOfMarriage)

        return pairsRepository.findCandidates(
            targetProfile.id,
            // same weight category (bmi);
            candidateGender, targetProfile.bmiCategory,
            candidateBirthdayFrom, candidateBirthdayTo,
            candidateHeightFrom, candidateHeightTo,
            candidateSmoking, candidateAlcohol,
            candidatePornographyWatching, candidateIntimateRelationsOutsideOfMarriage,
            // same appearance type
            targetProfile.appearanceType,
            // either same city/town or one of participants is ready to travel to meet other person
            targetProfile.populatedLocality.id,
            // one native language(s) or readiness to learn native languages of each other
            targetProfile.nativeLanguages
        ).asFlow().take(1).flatMapConcat<ProfileMatchInformation, DatingPair> { matchedCandidate ->
            println()
            println("current: $targetProfile")
            println("matched: $matchedCandidate")
            println()
            flow {
                try {
                    transactionalOperator.executeAndAwait {
                        pairsRepository.save(
                            DatingPair(
                                targetProfile.id,
                                matchedCandidate.id,
                                DatingGoal.findSoulMate,
                                LocalDateTime.now(),
                                true,
                                targetProfile,
                                matchedCandidate
                            )
                        )
                        // Allowing only 1 active pair per user on database level
                        pairsRepository.save(DatingPairLock(targetProfile.id))
                        pairsRepository.save(DatingPairLock(matchedCandidate.id))
                    }
                } catch (e: DataIntegrityViolationException) {
                    // TODO possible to get here ?
                    // 23505 status
                    val alreadyCreatedDatingPair = e.message?.contains("""violates unique constraint "dating_pair_lock_pk""""") ?: false
                    if (!alreadyCreatedDatingPair) {
                        throw e
                    }
                }
            }
        }
    }

    private fun matchHabit(recurrence: Recurrence) =
        when {
            abstaining.contains(recurrence) -> abstaining + undecided
            undecided.contains(recurrence) -> abstaining + undecided + doing
            else -> undecided + doing
        }
}