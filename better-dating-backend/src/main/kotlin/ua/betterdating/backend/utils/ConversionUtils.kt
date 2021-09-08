package ua.betterdating.backend.utils

import ua.betterdating.backend.*
import ua.betterdating.backend.data.*

fun toWebEntity(email: Email, profileInfo: ProfileInfo, height: Height, weight: Weight, activities: Map<String, Activity>, personalHealthEvaluation: ProfileEvaluation, secondStageProfileInformation: SecondStageData?): Profile {
    val eligibleForSecondStage = activities[ActivityType.IntimateRelationsOutsideOfMarriage.name] !== null
            && activities[ActivityType.PornographyWatching.name] !== null
    return Profile(
            email.id, email.email, profileInfo.nickname, profileInfo.gender, profileInfo.birthday, height.height, weight.weight,
            activities[ActivityType.PhysicalExercise.name]!!.recurrence, activities[ActivityType.Smoking.name]!!.recurrence,
            activities[ActivityType.Alcohol.name]!!.recurrence, activities[ActivityType.ComputerGames.name]!!.recurrence,
            activities[ActivityType.Gambling.name]!!.recurrence, activities[ActivityType.Haircut.name]!!.recurrence,
            activities[ActivityType.HairColoring.name]!!.recurrence, activities[ActivityType.Makeup.name]!!.recurrence,
            activities[ActivityType.IntimateRelationsOutsideOfMarriage.name]?.recurrence, activities[ActivityType.PornographyWatching.name]?.recurrence,
            personalHealthEvaluation.evaluation, eligibleForSecondStage, secondStageProfileInformation
    )
}
