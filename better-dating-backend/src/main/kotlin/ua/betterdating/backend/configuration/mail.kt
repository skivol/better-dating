package ua.betterdating.backend.configuration

import org.springframework.fu.kofu.configuration
import org.springframework.fu.kofu.freemarker.freeMarker
import org.springframework.fu.kofu.mail.mail
import ua.betterdating.backend.FreemarkerMailSender
import ua.betterdating.backend.ConsoleMailSender
import ua.betterdating.backend.SmotrinyMailSenderImpl

fun mailConfig(mailPassword: String) = configuration {
    beans {
        if (profiles.contains("mail") || profiles.contains("production")) {
            bean<SmotrinyMailSenderImpl>()
        } else {
            bean<ConsoleMailSender>()
        }
        bean<FreemarkerMailSender>()
    }

    mail {
        password = readPassword(profiles, mailPassword)
    }

    freeMarker()
}
