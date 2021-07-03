package ua.betterdating.backend.utils

import ua.betterdating.backend.*
import ua.betterdating.backend.data.*

fun toWebEntity(email: Email, profileInfo: ProfileInfo, height: Height, weight: Weight, activities: Map<String, Activity>, personalHealthEvaluation: ProfileEvaluation, secondStageProfileInformation: SecondStageData?): Profile {
    val eligibleForSecondStage = activities[ActivityType.intimateRelationsOutsideOfMarriage.name] !== null
            && activities[ActivityType.pornographyWatching.name] !== null
    return Profile(
            email.id, email.email, profileInfo.nickname, profileInfo.gender, profileInfo.birthday, height.height, weight.weight,
            activities[ActivityType.physicalExercise.name]!!.recurrence, activities[ActivityType.smoking.name]!!.recurrence,
            activities[ActivityType.alcohol.name]!!.recurrence, activities[ActivityType.computerGames.name]!!.recurrence,
            activities[ActivityType.gambling.name]!!.recurrence, activities[ActivityType.haircut.name]!!.recurrence,
            activities[ActivityType.hairColoring.name]!!.recurrence, activities[ActivityType.makeup.name]!!.recurrence,
            activities[ActivityType.intimateRelationsOutsideOfMarriage.name]?.recurrence, activities[ActivityType.pornographyWatching.name]?.recurrence,
            personalHealthEvaluation.evaluation, eligibleForSecondStage, secondStageProfileInformation
    )
}
