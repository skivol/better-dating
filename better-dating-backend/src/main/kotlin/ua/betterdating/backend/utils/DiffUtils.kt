package ua.betterdating.backend.utils

import ua.betterdating.backend.*
import ua.betterdating.backend.ActivityType.*
import ua.betterdating.backend.data.*
import java.time.Instant

fun changedHealthEvaluation(existingProfile: Profile, profile: Profile) = if (existingProfile.personalHealthEvaluation != profile.personalHealthEvaluation) {
    ProfileEvaluation(existingProfile.id!!, existingProfile.id!!, Instant.now(), profile.personalHealthEvaluation, null)
} else {
    null
}

fun changedActivities(existing: Profile, updated: Profile): List<Activity> {
    val changedActivities = mutableListOf<Activity>()
    val now = Instant.now()
    val profileId = existing.id!!

    if (existing.physicalExercise != updated.physicalExercise) {
        changedActivities.add(Activity(profileId, PhysicalExercise.name, now, updated.physicalExercise))
    }
    if (existing.smoking != updated.smoking) {
        changedActivities.add(Activity(profileId, Smoking.name, now, updated.smoking))
    }
    if (existing.alcohol != updated.alcohol) {
        changedActivities.add(Activity(profileId, Alcohol.name, now, updated.alcohol))
    }
    if (existing.computerGames != updated.computerGames) {
        changedActivities.add(Activity(profileId, ComputerGames.name, now, updated.computerGames))
    }
    if (existing.gambling != updated.gambling) {
        changedActivities.add(Activity(profileId, Gambling.name, now, updated.gambling))
    }
    if (existing.haircut != updated.haircut) {
        changedActivities.add(Activity(profileId, Haircut.name, now, updated.haircut))
    }
    if (existing.hairColoring != updated.hairColoring) {
        changedActivities.add(Activity(profileId, HairColoring.name, now, updated.hairColoring))
    }
    if (existing.makeup != updated.makeup) {
        changedActivities.add(Activity(profileId, Makeup.name, now, updated.makeup))
    }
    if (updated.intimateRelationsOutsideOfMarriage != null && existing.intimateRelationsOutsideOfMarriage != updated.intimateRelationsOutsideOfMarriage) {
        changedActivities.add(Activity(profileId, IntimateRelationsOutsideOfMarriage.name, now, updated.intimateRelationsOutsideOfMarriage))
    }
    if (updated.pornographyWatching != null && existing.pornographyWatching != updated.pornographyWatching) {
        changedActivities.add(Activity(profileId, PornographyWatching.name, now, updated.pornographyWatching))
    }
    return changedActivities
}

fun changedWeight(existing: Profile, updated: Profile) = if (existing.weight != updated.weight) {
    Weight(existing.id!!, Instant.now(), updated.weight)
} else {
    null
}

fun changedHeight(existing: Profile, updated: Profile) = if (existing.height != updated.height) {
    Height(existing.id!!, Instant.now(), updated.height)
} else {
    null
}

fun changedProfileInfo(existing: Profile, updated: Profile) = if (
        existing.nickname != updated.nickname
        || existing.gender != updated.gender
        || existing.birthday != updated.birthday
) {
    ProfileInfo(existing.id!!, updated.nickname, updated.gender, updated.birthday, null, Instant.now())
} else {
    null
}

fun changedEmail(existing: Profile, updated: Profile) = if (existing.email != updated.email) {
    Email(updated.email, false, existing.id!!)
} else {
    null
}

fun changedDatingProfileInfo(existing: Profile, updated: Profile): DatingProfileInfo? {
    val existingData = existing.secondStageData!!
    val updatedData = updated.secondStageData!!

    return if (existingData.goal != updatedData.goal
        || existingData.participateInAutomatedPairMatchingAndDateOrganization != updatedData.participateInAutomatedPairMatchingAndDateOrganization
        || existingData.appearanceType != updatedData.appearanceType
        || existingData.naturalHairColor != updatedData.naturalHairColor
        || existingData.eyeColor != updatedData.eyeColor
    ) {
        DatingProfileInfo(
            updated.id!!,
            updatedData.goal,
            updatedData.participateInAutomatedPairMatchingAndDateOrganization,
            updatedData.appearanceType,
            updatedData.naturalHairColor,
            updatedData.eyeColor
        )
    } else {
        null
    }
}

fun changedPopulatedLocality(existing: Profile, updated: Profile) = if (existing.secondStageData!!.populatedLocality != updated.secondStageData!!.populatedLocality) {
    UserPopulatedLocality(existing.id!!, updated.secondStageData.populatedLocality.id, 0)
} else {
    null
}

fun changedNativeLanguages(existing: Profile, updated: Profile): List<UserLanguage>? {
    val existingNativeLanguages = existing.secondStageData!!.nativeLanguages
    val updatedNativeLanguages = updated.secondStageData!!.nativeLanguages

    return if (existingNativeLanguages.size != updatedNativeLanguages.size
            || existingNativeLanguages.any { !updatedNativeLanguages.contains(it) }) {
        updatedNativeLanguages.mapIndexed { i, language -> UserLanguage(existing.id!!, language.id, i) }
    } else {
        null
    }
}

fun changedInterests(existing: Profile, updated: Profile): List<UserInterest>? {
    val existingInterests = existing.secondStageData!!.interests
    val updatedInterests = updated.secondStageData!!.interests

    return if (existingInterests.size != updatedInterests.size
            || existingInterests.any { !updatedInterests.contains(it) }) {
        updatedInterests.mapIndexed { i, interest -> UserInterest(existing.id!!, interest.id, i) }
    } else {
        null
    }
}

fun changedLikedPersonalQualities(existing: Profile, updated: Profile): List<UserPersonalQuality>? {
    val existingLiked = existing.secondStageData!!.likedPersonalQualities
    val updatedLiked = updated.secondStageData!!.likedPersonalQualities

    return if (existingLiked.size != updatedLiked.size
            || existingLiked.any { !updatedLiked.contains(it) }) {
        updatedLiked.mapIndexed { i, likedQuality -> UserPersonalQuality(existing.id!!, likedQuality.id, Attitude.Likes, i) }
    } else {
        null
    }
}

fun changedDislikedPersonalQualities(existing: Profile, updated: Profile): List<UserPersonalQuality>? {
    val existingDisliked = existing.secondStageData!!.dislikedPersonalQualities
    val updatedDisliked = updated.secondStageData!!.dislikedPersonalQualities

    return if (existingDisliked.size != updatedDisliked.size
            || existingDisliked.any { !updatedDisliked.contains(it) }) {
        updatedDisliked.mapIndexed { i, dislikedQuality -> UserPersonalQuality(existing.id!!, dislikedQuality.id, Attitude.Dislikes, i) }
    } else {
        null
    }
}
