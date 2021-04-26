package ua.betterdating.backend.configuration

import org.springframework.boot.logging.LogLevel.*
import org.springframework.fu.kofu.configuration

fun loggingConfig() = configuration {
    val production = profiles.contains("production")
    logging {
        level("ua.betterdating", if (production) ERROR else DEBUG)
        level("org.springframework.web", if (production) ERROR else INFO)
        level("io.netty", if (production) ERROR else INFO)
        level("io.r2dbc.postgresql.client", if (production) OFF else INFO)
        level("reactor.core", if (production) OFF else INFO)
        level("reactor.netty.channel", if (production) OFF else INFO)

        if (!production) {
            level("org.springframework.data.r2dbc", INFO)
        }
    }
}