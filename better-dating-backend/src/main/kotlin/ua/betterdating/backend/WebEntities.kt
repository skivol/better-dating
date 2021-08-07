package ua.betterdating.backend

import org.valiktor.functions.*
import org.valiktor.validate
import ua.betterdating.backend.data.Interest
import ua.betterdating.backend.data.Language
import ua.betterdating.backend.data.PersonalQuality
import ua.betterdating.backend.data.PopulatedLocality
import java.time.LocalDate
import java.util.*

class EmailValue(val email: String) {
    init {
        validate(this) {
            validate(EmailValue::email).isEmail()
        }
    }
}

class CreateProfileRequest(
        val acceptTerms: Boolean,
        email: String,
        nickname: String,
        gender: Gender,
        birthday: LocalDate,
        height: Float,
        weight: Float,
        physicalExercise: Recurrence,
        smoking: Recurrence,
        alcohol: Recurrence,
        computerGames: Recurrence,
        gambling: Recurrence,
        haircut: Recurrence,
        hairColoring: Recurrence,
        makeup: Recurrence,
        intimateRelationsOutsideOfMarriage: Recurrence?,
        pornographyWatching: Recurrence?,
        personalHealthEvaluation: Int
) : Profile(null, email, nickname, gender, birthday, height, weight, physicalExercise, smoking, alcohol, computerGames, gambling, haircut, hairColoring, makeup, intimateRelationsOutsideOfMarriage, pornographyWatching, personalHealthEvaluation) {
    init {
        validate(this) {
            validate(CreateProfileRequest::acceptTerms).isTrue()
        }
    }
}

open class Profile(
        var id: UUID?,
        var email: String,
        var nickname: String,
        val gender: Gender,
        val birthday: LocalDate,
        val height: Float,
        val weight: Float,
        val physicalExercise: Recurrence,
        val smoking: Recurrence,
        val alcohol: Recurrence,
        val computerGames: Recurrence,
        val gambling: Recurrence,
        val haircut: Recurrence,
        val hairColoring: Recurrence,
        val makeup: Recurrence,
        val intimateRelationsOutsideOfMarriage: Recurrence?,
        val pornographyWatching: Recurrence?,
        val personalHealthEvaluation: Int,
        val eligibleForSecondStage: Boolean? = null, // readonly
        val secondStageData: SecondStageData? = null
) {
    init {
        validate(this) {
            validate(Profile::email).isEmail().hasSize(max = 120)
            validate(Profile::nickname).isNotBlank().hasSize(max = 120)
            validate(Profile::birthday)
                    // younger than 150
                    .isGreaterThanOrEqualTo(LocalDate.now().minusYears(150))
                    // older than 12
                    .isLessThanOrEqualTo(LocalDate.now().minusYears(12))
            validate(Profile::height).isBetween(120f, 250f)
            validate(Profile::weight).isBetween(27f, 250f)
            validate(Profile::personalHealthEvaluation).isBetween(1, 10)
        }
    }
}

enum class Relation {
    matchedProfile, authorsProfile
}
class ProfileViewData(
    val profile: Profile,
    val relation: Relation
)

enum class Gender {
    female, male
}

enum class ActivityType {
    physicalExercise,
    smoking,
    alcohol,
    computerGames,
    gambling,
    haircut,
    hairColoring,
    makeup,
    intimateRelationsOutsideOfMarriage,
    pornographyWatching
}

enum class Recurrence {
    neverPurposefully,
    neverDidButDoNotKnowIfGoingToDoInFuture,
    neverDidAndNotGoingInFuture,
    didBeforeButDoNotKnowIfGoingToDoInFuture,
    didBeforeNotGoingInFuture,
    coupleTimesInYearOrMoreSeldom,
    coupleTimesInYear,
    coupleTimesInMonth,
    coupleTimesInWeek,
    everyDay,
    severalTimesInDay
}

enum class DeleteReason {
    expectedSomethingElse, tooComplicated, other
}

data class DeleteProfileData(val token: String, val reason: DeleteReason, val explanationComment: String) {
    init {
        validate(this) {
            validate(DeleteProfileData::explanationComment).hasSize(max = 255)
        }
    }
}

enum class UsageGoal {
    FindSoulMate, HaveSoulmateWantToCreateFamily
}

enum class AppearanceType {
    european, oriental, caucasian, indian, darkSkinned, hispanic, middleEastern, american, mixed
}

enum class HairColor {
    black, ginger, blond, brown, fair, gray
}

enum class EyeColor {
    darkBlue, blue, gray, green, amber, olive, brown, black, yellow
}

data class SecondStageData(
    val goal: UsageGoal,
    val participateInAutomatedPairMatchingAndDateOrganization: Boolean,
    val populatedLocality: PopulatedLocality,
    val nativeLanguages: List<Language>,
    val appearanceType: AppearanceType,
    val naturalHairColor: HairColor,
    val eyeColor: EyeColor,
    val interests: List<Interest>,
    val likedPersonalQualities: List<PersonalQuality>,
    val dislikedPersonalQualities: List<PersonalQuality>
) {
    init {
        validate(this) {
            validate(SecondStageData::nativeLanguages).hasSize(1)
            validate(SecondStageData::interests).hasSize(1)
            validate(SecondStageData::likedPersonalQualities).hasSize(1)
            validate(SecondStageData::dislikedPersonalQualities).hasSize(1)
        }
    }
}
