package ua.betterdating.backend.configuration

import io.r2dbc.spi.ConnectionFactoryOptions
import org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryOptionsBuilderCustomizer
import org.springframework.boot.autoconfigure.r2dbc.R2dbcProperties
import org.springframework.fu.kofu.configuration
import org.springframework.fu.kofu.flyway.flyway
import org.springframework.fu.kofu.r2dbc.dataR2dbc
import org.springframework.fu.kofu.r2dbc.r2dbc
import ua.betterdating.backend.data.ProfileInfoRepository
import ua.betterdating.backend.data.*
import java.time.Duration
import java.time.temporal.ChronoUnit

fun dataConfig(emailRepository: EmailRepository, rolesRepository: UserRoleRepository, loginInformationRepository: LoginInformationRepository, dbPasswordFile: String) = configuration {
    val dbPassword = readPassword(profiles, dbPasswordFile)
    val r2dbcProperties = configurationProperties<R2dbcProperties>(prefix = "datasource")
    dataR2dbc {
        r2dbc {
            url = r2dbcProperties.url
            username = r2dbcProperties.username
            password = dbPassword
            optionsCustomizers = listOf(ConnectionFactoryOptionsBuilderCustomizer {
                it.option(ConnectionFactoryOptions.CONNECT_TIMEOUT, Duration.of(30, ChronoUnit.SECONDS))
            })
            transactional = true
        }
    }

    flyway {
        url = r2dbcProperties.url.replace("r2dbc:", "jdbc:")
        user = r2dbcProperties.username
        password = dbPassword
    }

    beans {
        bean { emailRepository }
        bean { rolesRepository }
        bean { loginInformationRepository }
        bean<ExpiringTokenRepository>()
        bean<AcceptedTermsRepository>()
        bean<ProfileInfoRepository>()
        bean<HeightRepository>()
        bean<WeightRepository>()
        bean<ActivityRepository>()
        bean<ProfileEvaluationRepository>()
        bean<ViewOtherUserProfileTokenDataRepository>()
        bean<HistoryRepository>()
        bean<StatisticsRepository>()
        bean<PopulatedLocalitiesRepository>()
        bean<LanguagesRepository>()
        bean<InterestsRepository>()
        bean<PersonalQualitiesRepository>()
        bean<DatingProfileInfoRepository>()
        bean<UserPopulatedLocalityRepository>()
        bean<UserLanguageRepository>()
        bean<UserInterestRepository>()
        bean<UserPersonalQualityRepository>()

        bean<PairsRepository>()
        bean<DatesRepository>()
        bean<PlaceRepository>()
        bean<CheckInRepository>()
        bean<DateVerificationTokenDataRepository>()
        bean<ProfileCredibilityRepository>()
        bean<ProfileImprovementRepository>()
        bean<PairDecisionRepository>()
        bean<PairLockRepository>()
    }
}
