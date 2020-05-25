package ua.betterdating.backend

import org.springframework.fu.kofu.configuration
import org.springframework.fu.kofu.webflux.webFlux
import ua.betterdating.backend.handlers.EmailHandler
import ua.betterdating.backend.handlers.HealthHandler
import ua.betterdating.backend.handlers.UserProfileHandler

val dataConfig = configuration {
    beans {
        bean<EmailRepository>()
        bean<EmailVerificationTokenRepository>()
        bean<AcceptedTermsRepository>()
        bean<ProfileInfoRepository>()
        bean<HeightRepository>()
        bean<WeightRepository>()
        bean<ActivityRepository>()
        bean<ProfileEvaluationRepository>()
    }
}

val webConfig = configuration {
    beans {
        bean<SmotrinyMailSender>()
        bean<EmailHandler>()
        bean<UserProfileHandler>()
        bean<HealthHandler>()
        bean(::routes)
    }
    webFlux {
        port = if (profiles.contains("test")) 8181 else 8080
        netty()
        codecs {
            string()
            jackson()
        }
    }
}
