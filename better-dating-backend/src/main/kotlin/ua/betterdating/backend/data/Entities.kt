package ua.betterdating.backend.data

import org.springframework.data.annotation.Id
import ua.betterdating.backend.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

// TODO check if @Id annotation is still needed
class Email(
        var email: String,
        var verified: Boolean,
        @Id var id: UUID = UUID.randomUUID()
)

class ExpiringToken(
        @Id val id: UUID = UUID.randomUUID(),
        val profileId: UUID,
        val type: TokenType,
        val expires: LocalDateTime,
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
        val lastDateAccepted: LocalDateTime
)

class ProfileInfo(
        @Id val profileId: UUID,
        val nickname: String,
        val gender: Gender,
        val birthday: LocalDate,
        val createdAt: LocalDateTime?,
        val updatedAt: LocalDateTime?
)

class Height(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val date: LocalDateTime,
        val height: Float
)

class Weight(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val date: LocalDateTime,
        val weight: Float
)

class Activity(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val name: String,
        val date: LocalDateTime,
        val recurrence: Recurrence
)

class ProfileEvaluation(
        @Id val sourceProfileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val targetProfileId: UUID,
        val date: LocalDateTime,
        val evaluation: Int,
        val comment: String?
)

class EmailChangeHistory(
        @Id val id: Long,
        val profileId: UUID,
        val email: String,
        val changeOn: LocalDateTime
)

class ProfileDeletionFeedback(
        @Id val profileId: UUID,
        val reason: DeleteReason,
        val explanationComment: String
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

class ProfileViewHistory(
        @Id val viewerProfileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val targetProfileId: UUID,
        val date: LocalDateTime
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

class DatingProfileInfo(
        @Id val profileId: UUID,
        val goal: DatingGoal,
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
    likes, dislikes
}

class UserPersonalQuality(
        @Id val profileId: UUID, // the actual primary key is composite, specified here to avoid spring-data complaining
        val personalQualityId: UUID,
        val attitude: Attitude,
        val position: Int
)
