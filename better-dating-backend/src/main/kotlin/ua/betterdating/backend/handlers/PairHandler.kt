package ua.betterdating.backend.handlers

import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.function.server.ServerResponse.ok
import ua.betterdating.backend.FreemarkerMailSender
import ua.betterdating.backend.UsageGoal
import ua.betterdating.backend.badRequestException
import ua.betterdating.backend.data.*
import java.time.Instant
import java.util.*

class PairHandler(
    private val datesRepository: DatesRepository,
    private val pairsRepository: PairsRepository,
    private val pairLockRepository: PairLockRepository,
    private val pairDecisionRepository: PairDecisionRepository,
    private val datingProfileInfoRepository: DatingProfileInfoRepository,
    private val loginInformationRepository: LoginInformationRepository,
    private val emailRepository: EmailRepository,
    private val profileInfoRepository: ProfileInfoRepository,
    private val transactionalOperator: TransactionalOperator,
    private val mailSender: FreemarkerMailSender,
) {
    private data class PairDecisionRequest(
        val pairId: UUID,
        val decision: PairDecisionCategory,
    )
    suspend fun pairDecision(request: ServerRequest): ServerResponse {
        val payload = request.awaitBody<PairDecisionRequest>()
        val profileId = UUID.fromString(request.awaitPrincipal()!!.name)

        var pair = pairsRepository.findPairById(payload.pairId) ?: throw badRequestException("pair with this id not found")
        val verifiedDates = datesRepository.findVerifiedByPairId(pair.id)
        if (verifiedDates.isEmpty()) throw badRequestException("pair should have at least one verified date to submit a decision")

        val pairDecisions = pairDecisionRepository.findByPairId(pair.id)
        if (pairDecisions.any { it.profileId == profileId }) throw badRequestException("already submitted a decision")

        val otherUserAlreadySubmittedDecision = pairDecisions.isNotEmpty()
        val bothWantToContinue =
            otherUserAlreadySubmittedDecision && setOf(payload.decision, pairDecisions[0].decision).all { it == PairDecisionCategory.WantToContinueRelationshipsAndCreateFamily }

        transactionalOperator.executeAndAwait {
            pairDecisionRepository.save(PairDecision(pair.id, profileId, payload.decision, Instant.now()))
            pairLockRepository.delete(DatingPairLock(profileId)) // unlock for further participation in pair matching if needed

            val otherUserProfileId = if (pair.firstProfileId == profileId) pair.secondProfileId else pair.firstProfileId
            if (bothWantToContinue) {
                val otherUserEmail = emailRepository.findById(otherUserProfileId)!!.email
                val otherUserHost = loginInformationRepository.find(otherUserProfileId).lastHost
                val currentUserNickname = profileInfoRepository.findByProfileId(profileId)!!.nickname
                val subject = "Пользователь $currentUserNickname также проявил(а) намерение продолжать отношения и создать семью ! :)"
                mailSender.sendLink(
                    "TitleBodyAndLinkMessage.ftlh",
                    otherUserEmail,
                    subject,
                    otherUserHost,
                    "свидания"
                ) { link ->
                    object {
                        val title = subject
                        val actionLabel = "Свидания"
                        val actionUrl = link
                        val body = ""
                    }
                }
                // switch both user profiles to next usage goal of the system
                switchToFamilyCreationGoal(profileId)
                switchToFamilyCreationGoal(otherUserProfileId)
            } else if (otherUserAlreadySubmittedDecision) {
                // deactivate pair for now (as both submitted decisions, but not both want to continue)
                pair = pair.copy(active = false)
                pairsRepository.update(pair)
            }
        }

        return ok().json().bodyValueAndAwait(object {
            val bothWantToContinue = bothWantToContinue
            val pairActive = pair.active
        })
    }

    private suspend fun switchToFamilyCreationGoal(profileId: UUID) {
        datingProfileInfoRepository.update(
            datingProfileInfoRepository.find(profileId)!!.copy(
                goal = UsageGoal.HaveSoulmateWantToCreateFamily
            )
        )
    }
}
