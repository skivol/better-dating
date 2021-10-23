package ua.betterdating.backend.data

import org.springframework.data.annotation.Id
import ua.betterdating.backend.*
import java.time.Instant
import java.time.LocalDate
import java.util.*

class Email(
        email: String,
        var verified: Boolean,
        @Id var id: UUID = UUID.randomUUID()
) {
        var email: String = email.lowercase()
}

class ExpiringToken(
        @Id val id: UUID = UUID.randomUUID(),
        val profileId: UUID,
        val type: TokenType,
        val expires: Instant,
        val encodedValue: String
)

enum class TokenType {
        EMAIL_VERIFICATION,
        ONE_TIME_PASSWORD,
        ACCOUNT_REMOVAL,
        VIEW_OTHER_USER_PROFILE,
        DATE_VERIFICATION,
}

class AcceptedTerms(
        @Id val profileId: UUID,
        val lastDateAccepted: Instant
)

class ProfileInfo(
        @Id val profileId: UUID,
        val nickname: String,
        val gender: Gender,
        val birthday: LocalDate,
        val createdAt: Instant?,
        val updatedAt: Instant?
)

class Height(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val date: Instant,
        val height: Float
)

class Weight(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val date: Instant,
        val weight: Float
)

class Activity(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val name: String,
        val date: Instant,
        val recurrence: Recurrence
)

class ProfileEvaluation(
        @Id val sourceProfileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val targetProfileId: UUID,
        val date: Instant,
        val evaluation: Int,
        val comment: String?
)

enum class Role {
    ROLE_USER,
    ROLE_ADMIN
}

class UserRole(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val role: Role,
)

class ViewOtherUserProfileTokenData(
        @Id val tokenId: UUID,
        val targetProfileId: UUID
)

class UsageStats(
        val registered: Long,
        val removed: Long
)

data class PopulatedLocality(
        val id: UUID,
        val name: String,
        val region: String,
        val country: String
)

data class Language(
        val id: UUID,
        val name: String
)

data class Interest(
        val id: UUID,
        val name: String
)

data class PersonalQuality(
        val id: UUID,
        val name: String
)

data class DatingProfileInfo(
    @Id val profileId: UUID,
    val goal: UsageGoal,
    val participateInAutomatedPairMatchingAndDateOrganization: Boolean,
    val appearanceType: AppearanceType,
    val naturalHairColor: HairColor,
    val eyeColor: EyeColor
)

class UserPopulatedLocality(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val populatedLocalityId: UUID,
        val position: Int
)

class UserLanguage(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val languageId: UUID,
        val position: Int
)

class UserInterest(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val interestId: UUID,
        val position: Int
)

enum class Attitude {
    Likes, Dislikes
}

class UserPersonalQuality(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val personalQualityId: UUID,
        val attitude: Attitude,
        val position: Int
)
