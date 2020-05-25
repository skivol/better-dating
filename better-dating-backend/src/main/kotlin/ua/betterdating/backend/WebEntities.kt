package ua.betterdating.backend

import org.valiktor.functions.*
import org.valiktor.validate
import java.time.LocalDate
import java.util.*

fun validEmail(email: String?): String {
    EmailValue(email)
    return email!!;
}
data class EmailValue(val email: String?) {
    init {
        validate(this) {
            validate(EmailValue::email).isNotNull().isEmail()
        }
    }
}
data class EmailStatus(val used: Boolean)
class CreateProfileRequest(
        val acceptTerms: Boolean,
        email: String,
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
): Profile(null, email, gender, birthday, height, weight, physicalExercise, smoking, alcohol, computerGames, gambling, haircut, hairColoring, makeup, intimateRelationsOutsideOfMarriage, pornographyWatching, personalHealthEvaluation) {
    init {
        validate(this) {
            validate(CreateProfileRequest::acceptTerms).isTrue()
        }
    }
}
open class Profile(
        var id: UUID?,
        val email: String,
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
        val personalHealthEvaluation: Int
) {
    init {
        validate(this) {
            validate(Profile::email).isEmail().hasSize(max = 120)
            validate(Profile::birthday).validate { // use valiktor-javatime ?
                val youngerThan12 = LocalDate.now().minusYears(12).isBefore(it)
                val olderThan150 = it.isBefore(LocalDate.now().minusYears(150))
                !youngerThan12 && !olderThan150
            }
            validate(Profile::height).isBetween(120f, 250f)
            validate(Profile::weight).isBetween(27f, 250f)
            validate(Profile::personalHealthEvaluation).isBetween(1, 10)
        }
    }
}
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
    neverDid,
    neverPurposefully,
    didBeforeNotGoingInFuture,
    coupleTimesInYearOrMoreSeldom,
    coupleTimesInYear,
    coupleTimesInMonth,
    coupleTimesInWeek,
    everyDay,
    severalTimesInDay
}

data class VerifyEmailRequest(val token: String)

// https://docs.oracle.com/javase/8/docs/api/java/util/Base64.html
class Token(val id: UUID) {
    fun base64Value(): String {
        return Base64.getUrlEncoder().encodeToString("$id".toByteArray())
    }
}

fun parseToken(encodedToken: String): Token {
    try {
        val decodedToken = String(Base64.getUrlDecoder().decode(encodedToken))
        return Token(id = UUID.fromString(decodedToken))
    } catch (e: Exception) {
        throw InvalidTokenException()
    }
}
