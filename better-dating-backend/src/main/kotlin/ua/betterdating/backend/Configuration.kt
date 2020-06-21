package ua.betterdating.backend

import org.springframework.fu.kofu.configuration
import org.springframework.fu.kofu.redis.reactiveRedis
import org.springframework.fu.kofu.session.reactiveRedis
import org.springframework.fu.kofu.session.session
import org.springframework.fu.kofu.webflux.security
import org.springframework.fu.kofu.webflux.webFlux
import org.springframework.http.HttpMethod.POST
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.DelegatingPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.server.authentication.logout.*
import org.springframework.security.web.server.context.ServerSecurityContextRepository
import org.springframework.security.web.server.context.WebSessionServerSecurityContextRepository
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository
import org.springframework.security.web.server.csrf.CsrfToken
import org.springframework.security.web.server.header.ClearSiteDataServerHttpHeadersWriter
import org.springframework.security.web.server.header.ClearSiteDataServerHttpHeadersWriter.Directive.CACHE
import org.springframework.security.web.server.header.ClearSiteDataServerHttpHeadersWriter.Directive.COOKIES
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import ua.betterdating.backend.handlers.AuthHandler
import ua.betterdating.backend.handlers.EmailHandler
import ua.betterdating.backend.handlers.HealthHandler
import ua.betterdating.backend.handlers.UserProfileHandler


val dataConfig = configuration {
    beans {
        bean<EmailRepository>()
        bean<ExpiringTokenRepository>()
        bean<AcceptedTermsRepository>()
        bean<ProfileInfoRepository>()
        bean<HeightRepository>()
        bean<WeightRepository>()
        bean<ActivityRepository>()
        bean<ProfileEvaluationRepository>()
    }
}

val securityConfig = configuration {
    val securityContextRepository = WebSessionServerSecurityContextRepository()
    beans {
        bean<PasswordEncoder> {
            val idForEncode = "bcrypt"
            DelegatingPasswordEncoder(idForEncode, mapOf(idForEncode to BCryptPasswordEncoder(13)))
        }
        bean<ServerSecurityContextRepository> { securityContextRepository }
    }

    reactiveRedis {
        lettuce()
    }
    session {
        reactiveRedis()
    }
    security {
        securityCustomizer = { it.securityContextRepository(securityContextRepository) }
        http = {
            csrf {
                csrfTokenRepository = CookieServerCsrfTokenRepository.withHttpOnlyFalse()
            }
            formLogin { disable() }
            logout {
                logoutUrl = "/api/auth/logout"
                logoutHandler = logoutHandler()
                logoutSuccessHandler = HttpStatusReturningServerLogoutSuccessHandler()
            }

            authorizeExchange {
                // Idea
                authorize("/", permitAll)

                // Registration & Email verification / triggering new verification / contact
                authorize(pathMatchers(POST, "/api/user/profile"), permitAll)
                authorize("/api/user/email/**", permitAll)

                // Login
                authorize(pathMatchers(POST, "/api/auth/login-link"), permitAll) // consider having web client credentials
                authorize(pathMatchers(POST, "/api/auth/login"), permitAll)
                authorize("/api/support/csrf", permitAll)

                // Profile
                authorize("/api/user/profile/**", hasAuthority("ROLE_USER"))

                // Deny rest
                authorize(anyExchange, denyAll)
            }
        }
    }
}

val webConfig = configuration {
    beans {
        if (profiles.contains("mail") || profiles.contains("production")) {
            bean<SmotrinyMailSenderImpl>()
        } else {
            bean<NoOpMailSender>()
        }
        bean<FreemarkerMailSender>()
        bean<EmailHandler>()
        bean<UserProfileHandler>()
        bean<AuthHandler>()
        bean<HealthHandler>()
        bean(::routes)
    }

    enable(securityConfig)

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

fun logoutHandler(): DelegatingServerLogoutHandler {
    val securityContext = SecurityContextServerLogoutHandler()
    val writer = ClearSiteDataServerHttpHeadersWriter(CACHE, COOKIES)
    val clearSiteData = HeaderWriterServerLogoutHandler(writer)
    return DelegatingServerLogoutHandler(securityContext, clearSiteData)
}

class CsrfFilter : WebFilter { // https://github.com/spring-projects/spring-security/issues/5766
    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        return (exchange.getAttribute<Mono<CsrfToken>>(CsrfToken::class.java.name) ?: Mono.empty())
                .doOnSuccess {} // do nothing, just subscribe :/
                .then(chain.filter(exchange))
    }
}
