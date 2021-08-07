package ua.betterdating.backend.tasks

import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.reactive.asFlow
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import ua.betterdating.backend.*
import ua.betterdating.backend.Recurrence.*
import ua.betterdating.backend.data.*
import ua.betterdating.backend.utils.LoggerDelegate
import java.time.LocalDateTime

val abstaining = listOf(neverDidAndNotGoingInFuture, didBeforeNotGoingInFuture)
val undecided = listOf(neverDidButDoNotKnowIfGoingToDoInFuture, didBeforeButDoNotKnowIfGoingToDoInFuture)
val doing = listOf(coupleTimesInYearOrMoreSeldom, coupleTimesInYear, coupleTimesInMonth, coupleTimesInWeek, everyDay, severalTimesInDay)

class PairMatcherTask(
    private val pairsRepository: PairsRepository,
    private val pairLockRepository: PairLockRepository,
    private val tokenDataRepository: ViewOtherUserProfileTokenDataRepository,
    private val loginInformationRepository: LoginInformationRepository,
    private val transactionalOperator: TransactionalOperator,
    private val mailSender: FreemarkerMailSender
) {
    private val log by LoggerDelegate()

    @Scheduled(fixedDelayString = "PT5m") // run constantly with 5 minutes pause
    fun match() {
        runBlocking { // https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html
            doMatching()
        }

        // checkout Spring Batch ? (https://docs.spring.io/spring-batch/docs/current/reference/html/index.html)
    }

    private suspend fun doMatching() {
        log.debug("Matching pairs!")

        // users are processed in registration order
        pairsRepository.usersToFindMatchesFor()
            .asFlow()
            .collect(this::findMatches)

        log.debug("Done!")
    }

    private suspend fun findMatches(targetProfileWithEmail: ProfileMatchInformationWithEmail) {
        val targetProfile = targetProfileWithEmail.profileMatchInformation
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
        // both should have corresponding intentions (for example, both are not going to do these things in the future, or going to continue doing it to some extent).
        // In case of those who haven't decided yet - they can be matched with everybody.
        val candidateSmoking = matchHabit(targetProfile.smoking)
        val candidateAlcohol = matchHabit(targetProfile.alcohol)
        val candidatePornographyWatching = matchHabit(targetProfile.pornographyWatching)
        val candidateIntimateRelationsOutsideOfMarriage = matchHabit(targetProfile.intimateRelationsOutsideOfMarriage)

        val matchedCandidateWithEmail = pairsRepository.findCandidates(
            targetProfile.id,
            UsageGoal.FindSoulMate,
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
        ).awaitFirstOrNull()

        val matchedCandidate = (matchedCandidateWithEmail ?: return).profileMatchInformation

        log.debug("current: {}", targetProfile)
        log.debug("matched: {}", matchedCandidate)

        transactionalOperator.executeAndAwait {
            pairsRepository.save(
                DatingPair(
                    firstProfileId = targetProfile.id,
                    secondProfileId = matchedCandidate.id,
                    goal = UsageGoal.FindSoulMate,
                    whenMatched = LocalDateTime.now(),
                    active = true,
                    firstProfileSnapshot = targetProfile,
                    secondProfileSnapshot = matchedCandidate
                )
            )
            // Allowing only 1 active pair per user on database level
            pairLockRepository.save(DatingPairLock(targetProfile.id))
            pairLockRepository.save(DatingPairLock(matchedCandidate.id))

            // Consider: move token generation / email sending to a different task if becomes too slow/unreliable
            val subject =
                { nickname: String -> "Ссылка для просмотра профиля пользователя $nickname с которым/которой будет организовано свидание" }

            val body = "Рекомендуется внимательно изучить профиль и при личной встрече проверить его истинность ;). " +
                    "Детали свидания будут сообщены в последующем письме. Их также можно найти в меню \"Пары и Свидания\" на сайте."

            val firstUserLastHost = loginInformationRepository.find(targetProfile.id).lastHost
            // notify target user
            mailSender.viewOtherUserProfile(
                targetProfile.id,
                targetProfileWithEmail.email,
                subject(matchedCandidateWithEmail.nickname),
                body,
                firstUserLastHost
            ) { token ->
                tokenDataRepository.save(
                    ViewOtherUserProfileTokenData(
                        token.id,
                        matchedCandidate.id
                    )
                )
            }

            val secondUserLastHost = loginInformationRepository.find(matchedCandidate.id).lastHost
            // notify matched user
            mailSender.viewOtherUserProfile(
                matchedCandidate.id,
                matchedCandidateWithEmail.email,
                subject(targetProfileWithEmail.nickname),
                body,
                secondUserLastHost
            ) { token ->
                tokenDataRepository.save(
                    ViewOtherUserProfileTokenData(
                        token.id,
                        targetProfile.id
                    )
                )
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