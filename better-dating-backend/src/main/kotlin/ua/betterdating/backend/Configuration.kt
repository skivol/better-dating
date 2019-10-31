package ua.betterdating.backend

import org.springframework.fu.kofu.configuration
import org.springframework.fu.kofu.webflux.webFlux
import ua.betterdating.backend.handlers.HealthHandler

val dataConfig = configuration {
    beans {
        bean<EmailRepository>()
        bean<EmailVerificationTokenRepository>()
    }
}

val webConfig = configuration {
    beans {
        bean<SmotrinyMailSender>()
        bean<EmailHandler>()
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
