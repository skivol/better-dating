package ua.betterdating.backend.configuration

import org.springframework.fu.kofu.configuration
import org.springframework.fu.kofu.webflux.webFlux
import org.springframework.security.web.server.csrf.CsrfToken
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import ua.betterdating.backend.EmailRepository
import ua.betterdating.backend.handlers.AuthHandler
import ua.betterdating.backend.handlers.EmailHandler
import ua.betterdating.backend.handlers.HealthHandler
import ua.betterdating.backend.handlers.UserProfileHandler

fun webConfig(emailRepository: EmailRepository) = configuration {
    beans {
        bean<EmailHandler>()
        bean<UserProfileHandler>()
        bean<AuthHandler>()
        bean<HealthHandler>()
        bean(::routes)
    }

    enable(securityConfig(emailRepository))

    webFlux {
        port = if (profiles.contains("test")) 8181 else 8080
        netty()
        codecs {
            string()
            jackson()
        }
        filter<CsrfFilter>()
    }
}

class CsrfFilter : WebFilter { // https://github.com/spring-projects/spring-security/issues/5766
    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        return (exchange.getAttribute<Mono<CsrfToken>>(CsrfToken::class.java.name) ?: Mono.empty())
                .doOnSuccess {} // do nothing, just subscribe :/
                .then(chain.filter(exchange))
    }
}
